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

    function getComponentZone(component) {
        if (['psu', 'storage', 'motherboard', 'case'].includes(component)) return 'case';
        if (['keyboard', 'mouse', 'monitor', 'os-installer'].includes(component)) return 'external';
        return 'motherboard';
    }

    function getSlotDisplayName(slotType) {
        return SLOT_NAMES[slotType] || slotType;
    }

    function buildWrongPlacementHints(placedComponents) {
        const wrong = Object.entries(placedComponents || {}).filter(([, info]) => info && !info.correct);
        return wrong.map(([slotType, info]) => {
            const placed = getSlotDisplayName(info.type);
            const expected = getSlotDisplayName(slotType);
            return `${placed} seharusnya tidak di ${expected}.`;
        });
    }

    const api = { getComponentZone, getSlotDisplayName, buildWrongPlacementHints };
    globalScope.ComputerLearningRules = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
