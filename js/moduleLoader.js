/**
 * Lazy loader untuk mode game berat agar initial load lebih cepat.
 */
const ModuleLoader = (() => {
    const modeScripts = {
        robot: 'js/robot.js',
        network: 'js/network.js',
        computer: 'js/computer.js',
        coding: 'js/codingPuzzle.js',
        circuit: 'js/circuit.js'
    };

    const loadedScripts = new Set();
    const pendingScripts = new Map();

    function loadScript(src) {
        if (loadedScripts.has(src)) return Promise.resolve();
        if (pendingScripts.has(src)) return pendingScripts.get(src);

        const scriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = () => {
                loadedScripts.add(src);
                pendingScripts.delete(src);
                resolve();
            };
            script.onerror = () => {
                pendingScripts.delete(src);
                reject(new Error(`Gagal memuat skrip: ${src}`));
            };
            document.head.appendChild(script);
        });

        pendingScripts.set(src, scriptPromise);
        return scriptPromise;
    }

    async function loadMode(mode) {
        const src = modeScripts[mode];
        if (!src) return;
        await loadScript(src);
    }

    function preload(mode) {
        loadMode(mode).catch(() => {
            // Silent preload failure; loadMode tetap akan melempar error saat dipakai.
        });
    }

    return {
        loadMode,
        preload
    };
})();

window.ModuleLoader = ModuleLoader;
