<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserBalance;
use App\Services\TelegramAuthService;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TelegramWebAppAuthTest extends TestCase
{
    /**
     * Test that a valid Telegram initData is processed correctly
     */
    #[Test]
    public function it_authenticates_user_with_valid_telegram_init_data(): void
    {
        // Create a mock valid initData
        $botToken = config('services.telegram.bot_token');
        
        // Simulate valid Telegram initData
        // Format: param1=value1&param2=value2&...&hash=signature
        $userData = json_encode([
            'id' => 123456789,
            'first_name' => 'Test',
            'last_name' => 'User',
            'username' => 'testuser',
        ]);
        
        $authDate = time();
        $dataCheckString = "auth_date=$authDate\nuser=" . urlencode($userData);
        
        $secretKey = hash_hmac('sha256', 'WebAppData', $botToken, true);
        $hash = hash_hmac('sha256', $dataCheckString, $secretKey);
        
        $initData = "auth_date=$authDate&user=" . urlencode($userData) . "&hash=$hash";
        
        // Test the auth endpoint
        $response = $this->postJson('/telegram/webapp/session', [
            'init_data' => $initData,
        ]);
        
        // Should get 200 OK
        $response->assertOk();
        $response->assertJsonStructure([
            'status',
            'user' => ['id', 'username', 'role'],
        ]);
        
        // User should be created in database
        $this->assertDatabaseHas('users', [
            'id' => 123456789,
            'username' => 'testuser',
            'role' => 'user',
        ]);
        
        // UserBalance should be created
        $this->assertDatabaseHas('user_balances', [
            'user_id' => 123456789,
            'balance' => 0,
        ]);
        
        // User should be authenticated
        $this->assertAuthenticatedAs(User::find(123456789));
    }

    /**
     * Test that invalid initData is rejected
     */
    #[Test]
    public function it_rejects_invalid_telegram_init_data(): void
    {
        $response = $this->postJson('/telegram/webapp/session', [
            'init_data' => 'invalid_data',
        ]);
        
        $response->assertStatus(401);
        $response->assertJsonFragment([
            'message' => 'Invalid or expired init data',
        ]);
    }

    /**
     * Test that empty initData is rejected
     */
    #[Test]
    public function it_rejects_empty_init_data(): void
    {
        $response = $this->postJson('/telegram/webapp/session', [
            'init_data' => '',
        ]);
        
        $response->assertStatus(401);
    }

    /**
     * Test JSON body parsing
     */
    #[Test]
    public function it_parses_json_body_correctly(): void
    {
        $botToken = config('services.telegram.bot_token');
        
        $userData = json_encode([
            'id' => 987654321,
            'first_name' => 'John',
            'username' => 'johnuser',
        ]);
        
        $authDate = time();
        $dataCheckString = "auth_date=$authDate\nuser=" . urlencode($userData);
        
        $secretKey = hash_hmac('sha256', 'WebAppData', $botToken, true);
        $hash = hash_hmac('sha256', $dataCheckString, $secretKey);
        
        $initData = "auth_date=$authDate&user=" . urlencode($userData) . "&hash=$hash";
        
        // Send as JSON with Content-Type header
        $response = $this->withHeader('Content-Type', 'application/json')
            ->postJson('/telegram/webapp/session', [
                'init_data' => $initData,
            ]);
        
        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'id' => 987654321,
            'username' => 'johnuser',
        ]);
    }

    /**
     * Test that existing user is updated but not duplicated
     */
    #[Test]
    public function it_updates_existing_user(): void
    {
        // Create a user first
        $user = User::create([
            'id' => 555555555,
            'username' => 'oldusername',
            'role' => 'user',
        ]);
        
        // Now authenticate with same ID but different username
        $botToken = config('services.telegram.bot_token');
        
        $userData = json_encode([
            'id' => 555555555,
            'first_name' => 'Updated',
            'username' => 'newusername',
        ]);
        
        $authDate = time();
        $dataCheckString = "auth_date=$authDate\nuser=" . urlencode($userData);
        
        $secretKey = hash_hmac('sha256', 'WebAppData', $botToken, true);
        $hash = hash_hmac('sha256', $dataCheckString, $secretKey);
        
        $initData = "auth_date=$authDate&user=" . urlencode($userData) . "&hash=$hash";
        
        $response = $this->postJson('/telegram/webapp/session', [
            'init_data' => $initData,
        ]);
        
        $response->assertOk();
        
        // Should only have 1 user with this ID
        $this->assertCount(1, User::where('id', 555555555)->get());
        
        // Username should be updated
        $this->assertDatabaseHas('users', [
            'id' => 555555555,
            'username' => 'newusername',
        ]);
    }
}
