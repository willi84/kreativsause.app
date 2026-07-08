const createPiSoundboard = (): void => {
    const tracks = document.querySelectorAll<HTMLElement>('[data-pi-track]');

    if (tracks.length === 0) {
        return;
    }

    let currentAudio: HTMLAudioElement | null = null;
    let currentButton: HTMLButtonElement | null = null;
    const localUrls = new Map<string, string>();

    const setButtonState = (button: HTMLButtonElement | null, state: 'idle' | 'playing'): void => {
        if (!button) {
            return;
        }

        button.dataset.state = state;
        button.setAttribute('aria-pressed', state === 'playing' ? 'true' : 'false');
    };

    const stopCurrentAudio = (): void => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        setButtonState(currentButton, 'idle');
        currentAudio = null;
        currentButton = null;
    };

    tracks.forEach((track) => {
        const button = track.querySelector<HTMLButtonElement>('[data-pi-track-button]');
        const upload = track.querySelector<HTMLInputElement>('[data-pi-track-upload]');
        const sourceLabel = track.querySelector<HTMLElement>('[data-pi-track-source]');
        const trackId = track.dataset.piTrack;
        const sampleUrl = track.dataset.piSample;

        if (!button || !upload || !sourceLabel || !trackId || !sampleUrl) {
            return;
        }

        upload.addEventListener('change', () => {
            const file = upload.files?.[0];
            const previousUrl = localUrls.get(trackId);

            if (!file) {
                return;
            }

            if (previousUrl) {
                URL.revokeObjectURL(previousUrl);
            }

            localUrls.set(trackId, URL.createObjectURL(file));
            sourceLabel.textContent = file.name;
        });

        button.addEventListener('click', () => {
            const activeUrl = localUrls.get(trackId) ?? sampleUrl;

            if (currentButton === button) {
                stopCurrentAudio();
                return;
            }

            stopCurrentAudio();

            currentAudio = new Audio(activeUrl);
            currentButton = button;
            setButtonState(button, 'playing');

            currentAudio.addEventListener('ended', stopCurrentAudio, { once: true });
            currentAudio.addEventListener('error', () => {
                sourceLabel.textContent = 'Fehler beim Laden';
                stopCurrentAudio();
            }, { once: true });

            currentAudio.play().catch(() => {
                sourceLabel.textContent = 'Start blockiert';
                stopCurrentAudio();
            });
        });
    });

    window.addEventListener('beforeunload', () => {
        localUrls.forEach((url) => URL.revokeObjectURL(url));
    });
};

export { createPiSoundboard };
