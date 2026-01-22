import { usePage } from '@inertiajs/react';

export default function useAuth() {
    const { props } = usePage();

    const user = props?.auth?.user ?? null;

    return {
        user,
        isAuth: !!user,
        isGuest: !user,
    };
}