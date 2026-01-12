import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // eslint-disable-next-line prefer-template
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <div className="ReloadPrompt-container">
            {needRefresh && (
                <div className="fixed bottom-0 right-0 m-6 p-6 rounded-lg shadow-xl bg-zinc-800 border border-zinc-700 z-[99999] max-w-sm">
                    <div className="mb-2 text-sm text-gray-200">
                        <span>Nouveau contenu disponible, cliquez pour mettre à jour.</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                        {needRefresh && (
                            <button
                                className="px-4 py-2 text-sm font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                                onClick={() => updateServiceWorker(true)}
                            >
                                Mettre à jour
                            </button>
                        )}
                        <button
                            className="px-4 py-2 text-sm font-medium rounded border border-zinc-600 hover:bg-zinc-700 text-gray-300 transition-colors"
                            onClick={() => close()}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReloadPrompt;
