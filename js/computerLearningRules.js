/**
 * Rules edukatif untuk mode Build Computer.
 */
(function (globalScope) {
    const SLOT_NAMES = {
        cpu: 'CPU Socket',
        ram: 'RAM DIMM Slot',
        gpu: 'PCIe GPU Slot',
        cooler: 'CPU Cooler Mount',
        motherboard: 'Motherboard Tray',
        storage: 'Drive Bay (SSD/HDD)',
        psu: 'PSU Bay',
        case: 'PC Case Chassis',
        monitor: 'Monitor Output',
        keyboard: 'Keyboard (Input)',
        mouse: 'Mouse (Input)',
        'bios-chip': 'BIOS Chip Area',
        alu: 'ALU Block',
        register: 'Register Bank',
        'l1-cache': 'L1 Cache Layer',
        'l2-cache': 'L2 Cache Layer',
        'l3-cache': 'L3 Cache Layer',
        'north-bridge': 'North Bridge',
        'south-bridge': 'South Bridge',
        'usb-controller': 'USB Controller',
        'os-installer': 'OS Installation Stage'
    };

    const ZONE_LABELS = {
        motherboard: 'zona motherboard',
        case: 'zona inside PC case',
        external: 'zona external I/O'
    };

    function getComponentZone(component) {
        if (['psu', 'storage', 'motherboard', 'case'].includes(component)) return 'case';
        if (['keyboard', 'mouse', 'monitor', 'os-installer'].includes(component)) return 'external';
        return 'motherboard';
    }

    function getZoneLabel(zone) {
        return ZONE_LABELS[zone] || zone;
    }

    function getSlotDisplayName(slotType) {
        return SLOT_NAMES[slotType] || slotType;
    }

    function analyzePlacementIssues(placedComponents) {
        const issues = {
            zoneMismatch: [],
            slotMismatch: []
        };

        Object.entries(placedComponents || {}).forEach(([slotType, info]) => {
            if (!info || info.correct) return;
            const expectedZone = getComponentZone(slotType);
            const actualZone = getComponentZone(info.type);

            if (expectedZone !== actualZone) {
                issues.zoneMismatch.push({
                    slotType,
                    placedType: info.type,
                    expectedZone,
                    actualZone
                });
                return;
            }

            issues.slotMismatch.push({
                slotType,
                placedType: info.type,
                expectedZone
            });
        });

        return issues;
    }

    function buildWrongPlacementHints(placedComponents) {
        const issues = analyzePlacementIssues(placedComponents);
        const hints = [];

        issues.zoneMismatch.forEach((issue) => {
            const placed = getSlotDisplayName(issue.placedType);
            hints.push(`${placed} termasuk ${getZoneLabel(issue.actualZone)}, bukan ${getZoneLabel(issue.expectedZone)}.`);
        });

        issues.slotMismatch.forEach((issue) => {
            const placed = getSlotDisplayName(issue.placedType);
            const expected = getSlotDisplayName(issue.slotType);
            hints.push(`${placed} seharusnya ditempatkan di ${expected}.`);
        });

        return hints;
    }

    const api = {
        getComponentZone,
        getZoneLabel,
        getSlotDisplayName,
        analyzePlacementIssues,
        buildWrongPlacementHints
    };
    globalScope.ComputerLearningRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
