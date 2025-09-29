import StakeInvitationSystem from "@/components/stakes/StakeInvitationSystem";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function StakeInvitePage({ params }: PageProps) {
    const { id } = await params;

    return (
        <div className="min-h-screen bg-gray-50">
            <StakeInvitationSystem invitationId={id} />
        </div>
    );
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;

    return {
        title: 'Join Stake - SmartStake',
        description: 'You\'ve been invited to join a stake! Support someone in achieving their goal.',
        openGraph: {
            title: 'Join Stake - SmartStake',
            description: 'You\'ve been invited to join a stake! Support someone in achieving their goal.',
            type: 'website',
        },
    };
}
