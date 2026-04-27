/**
 * Rule helpers edukatif untuk mode Robot Logic.
 */
(function (globalScope) {
    function getRobotGradeFocus(levelId) {
        if (levelId <= 10) return 'Fase E SMA - Dasar algoritma';
        if (levelId <= 15) return 'Fase F SMA - Optimasi algoritma';
        return 'Fase F SMA - Berpikir komputasional paralel';
    }

    function hasObstacle(grid) {
        if (!Array.isArray(grid)) return false;
        return grid.some((row) => Array.isArray(row) && row.includes('X'));
    }

    function usesLoop(level) {
        const seq = Array.isArray(level && level.solution) ? level.solution : [];
        return seq.includes('loop');
    }

    function buildRobotObjectives(level) {
        if (!level) {
            return ['Menyusun urutan perintah sederhana untuk menyelesaikan masalah.'];
        }

        const objectives = [
            'Menyusun urutan perintah yang logis untuk mencapai tujuan robot.'
        ];

        if (usesLoop(level)) {
            objectives.push('Mengoptimalkan algoritma dengan loop agar solusi lebih efisien.');
        }

        if (level.dualMode === 'mirror') {
            objectives.push('Menerapkan transformasi mirror untuk memprediksi hasil dua perspektif.');
        } else if (level.dualMode) {
            objectives.push('Menyinkronkan dua agen paralel dengan satu set instruksi bersama.');
        }

        if (hasObstacle(level.grid)) {
            objectives.push('Memecah masalah menjadi langkah aman untuk menghindari rintangan.');
        }

        if (level.id >= 3) {
            objectives.push('Menganalisis perubahan orientasi robot saat menggunakan perintah belok.');
        }

        if (level.id >= 14) {
            objectives.push('Mengevaluasi efisiensi langkah terhadap batas perintah level.');
        }

        return objectives.slice(0, 3);
    }

    function buildRobotCoachingHints(context) {
        const hints = [];
        const reason = context && context.reason;
        const dualMode = context && context.dualMode;

        if (reason === 'out') {
            hints.push('Cek orientasi robot sebelum MAJU agar tidak keluar grid.');
            hints.push('Gunakan belok lebih awal saat posisi robot berada di tepi peta.');
        } else if (reason === 'wall') {
            hints.push('Tambahkan belok sebelum rintangan lalu lanjutkan maju di jalur aman.');
            hints.push('Baca pola tembok per baris untuk menentukan titik putar terbaik.');
        } else {
            hints.push('Ulangi simulasi perlahan dan cek urutan perintah pada langkah gagal.');
        }

        if (dualMode === 'mirror') {
            hints.push('Di mode mirror, KIRI pada robot biru menjadi KANAN pada robot merah.');
        } else if (dualMode) {
            hints.push('Pastikan instruksi aman untuk kedua robot secara bersamaan.');
        }

        return hints.slice(0, 3);
    }

    const api = {
        getRobotGradeFocus,
        buildRobotObjectives,
        buildRobotCoachingHints
    };

    globalScope.RobotLearningRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
