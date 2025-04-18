"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const utils_1 = require("solidity-ast/utils");
const hardhat_1 = require("hardhat");
const ast_dereferencer_1 = require("./ast-dereferencer");
const storage_1 = require("./storage");
const layout_1 = require("./storage/layout");
const extract_1 = require("./storage/extract");
const type_id_1 = require("./utils/type-id");
const test = ava_1.default;
test.before(async (t) => {
    const buildInfo = await hardhat_1.artifacts.getBuildInfo('contracts/test/Storage.sol:Storage1');
    if (buildInfo === undefined) {
        throw new Error('Build info not found');
    }
    const solcOutput = buildInfo.output;
    const contracts = {};
    for (const def of utils_1.findAll('ContractDefinition', solcOutput.sources['contracts/test/Storage.sol'].ast)) {
        contracts[def.name] = def;
    }
    const deref = ast_dereferencer_1.astDereferencer(solcOutput);
    t.context.extractStorageLayout = name => extract_1.extractStorageLayout(contracts[name], dummyDecodeSrc, deref);
});
const dummyDecodeSrc = () => 'file.sol:1';
test('Storage1', t => {
    const layout = t.context.extractStorageLayout('Storage1');
    t.snapshot(stabilizeStorageLayout(layout));
});
test('Storage2', t => {
    const layout = t.context.extractStorageLayout('Storage2');
    t.snapshot(stabilizeStorageLayout(layout));
});
test('storage upgrade equal', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Equal_V1');
    const v2 = t.context.extractStorageLayout('StorageUpgrade_Equal_V2');
    const comparison = storage_1.getStorageUpgradeErrors(v1, v2);
    t.deepEqual(comparison, []);
});
test('storage upgrade append', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Append_V1');
    const v2 = t.context.extractStorageLayout('StorageUpgrade_Append_V2');
    const comparison = storage_1.getStorageUpgradeErrors(v1, v2);
    t.deepEqual(comparison, []);
});
test('storage upgrade delete', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Delete_V1');
    const v2 = t.context.extractStorageLayout('StorageUpgrade_Delete_V2');
    const comparison = storage_1.getStorageUpgradeErrors(v1, v2);
    t.like(comparison, {
        length: 1,
        0: {
            kind: 'delete',
            original: {
                contract: 'StorageUpgrade_Delete_V1',
                label: 'x1',
                type: {
                    id: 't_uint256',
                },
            },
        },
    });
});
test('storage upgrade replace', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Replace_V1');
    const v2 = t.context.extractStorageLayout('StorageUpgrade_Replace_V2');
    const comparison = storage_1.getStorageUpgradeErrors(v1, v2);
    t.like(comparison, {
        length: 1,
        0: {
            kind: 'replace',
            original: {
                contract: 'StorageUpgrade_Replace_V1',
                label: 'x2',
                type: {
                    id: 't_uint256',
                },
            },
            updated: {
                contract: 'StorageUpgrade_Replace_V2',
                label: 'renamed',
                type: {
                    id: 't_string_storage',
                },
            },
        },
    });
});
test('storage upgrade rename', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Rename_V1');
    const v2 = t.context.extractStorageLayout('StorageUpgrade_Rename_V2');
    const comparison = storage_1.getStorageUpgradeErrors(v1, v2);
    t.like(comparison, {
        length: 1,
        0: {
            kind: 'rename',
            original: {
                contract: 'StorageUpgrade_Rename_V1',
                label: 'x2',
                type: {
                    id: 't_uint256',
                },
            },
            updated: {
                contract: 'StorageUpgrade_Rename_V2',
                label: 'renamed',
                type: {
                    id: 't_uint256',
                },
            },
        },
    });
});
test('storage upgrade with obvious mismatch', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_ObviousMismatch_V1');
    const v2_Bad = t.context.extractStorageLayout('StorageUpgrade_ObviousMismatch_V2_Bad');
    t.like(storage_1.getStorageUpgradeErrors(v1, v2_Bad), {
        length: 3,
        0: {
            kind: 'typechange',
            change: { kind: 'obvious mismatch' },
            original: { label: 'x1' },
            updated: { label: 'x1' },
        },
        1: {
            kind: 'typechange',
            change: { kind: 'obvious mismatch' },
            original: { label: 's1' },
            updated: { label: 's1' },
        },
        2: {
            kind: 'typechange',
            change: { kind: 'obvious mismatch' },
            original: { label: 'a1' },
            updated: { label: 'a1' },
        },
    });
});
test('storage upgrade with structs', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Struct_V1');
    const v2_Ok = t.context.extractStorageLayout('StorageUpgrade_Struct_V2_Ok');
    t.deepEqual(storage_1.getStorageUpgradeErrors(v1, v2_Ok), []);
    const v2_Bad = t.context.extractStorageLayout('StorageUpgrade_Struct_V2_Bad');
    t.like(storage_1.getStorageUpgradeErrors(v1, v2_Bad), {
        length: 6,
        0: {
            kind: 'typechange',
            change: {
                kind: 'struct members',
                ops: {
                    length: 1,
                    0: { kind: 'delete' },
                },
            },
            original: { label: 'data1' },
            updated: { label: 'data1' },
        },
        1: {
            kind: 'typechange',
            change: {
                kind: 'struct members',
                ops: {
                    length: 1,
                    0: { kind: 'append' },
                },
            },
            original: { label: 'data2' },
            updated: { label: 'data2' },
        },
        2: {
            kind: 'typechange',
            change: {
                kind: 'mapping value',
                inner: { kind: 'struct members' },
            },
            original: { label: 'm' },
            updated: { label: 'm' },
        },
        3: {
            kind: 'typechange',
            change: {
                kind: 'array value',
                inner: { kind: 'struct members' },
            },
            original: { label: 'a1' },
            updated: { label: 'a1' },
        },
        4: {
            kind: 'typechange',
            change: {
                kind: 'array value',
                inner: { kind: 'struct members' },
            },
            original: { label: 'a2' },
            updated: { label: 'a2' },
        },
        5: {
            kind: 'typechange',
            change: {
                kind: 'struct members',
                ops: {
                    length: 3,
                    0: { kind: 'typechange' },
                    1: { kind: 'typechange' },
                    2: { kind: 'typechange' },
                },
            },
            original: { label: 'data3' },
            updated: { label: 'data3' },
        },
    });
});
test('storage upgrade with missing struct members', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Struct_V1');
    const v2 = t.context.extractStorageLayout('StorageUpgrade_Struct_V2_Ok');
    const t_struct = Object.keys(v1.types).find(t => type_id_1.stabilizeTypeIdentifier(t) === 't_struct(Struct1)storage');
    if (t_struct === undefined) {
        throw new Error('Struct type not found');
    }
    // Simulate missing struct members
    v1.types[t_struct].members = undefined;
    t.like(storage_1.getStorageUpgradeErrors(v1, v2), {
        0: {
            kind: 'typechange',
            change: { kind: 'missing members' },
            original: { label: 'data1' },
            updated: { label: 'data1' },
        },
    });
    t.deepEqual(storage_1.getStorageUpgradeErrors(v1, v2, { unsafeAllowCustomTypes: true }), []);
});
test('storage upgrade with enums', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Enum_V1');
    const v2_Ok = t.context.extractStorageLayout('StorageUpgrade_Enum_V2_Ok');
    t.deepEqual(storage_1.getStorageUpgradeErrors(v1, v2_Ok), []);
    const v2_Bad = t.context.extractStorageLayout('StorageUpgrade_Enum_V2_Bad');
    t.like(storage_1.getStorageUpgradeErrors(v1, v2_Bad), {
        length: 4,
        0: {
            kind: 'typechange',
            change: {
                kind: 'enum members',
                ops: {
                    length: 1,
                    0: { kind: 'delete' },
                },
            },
            original: { label: 'data1' },
            updated: { label: 'data1' },
        },
        1: {
            kind: 'typechange',
            change: {
                kind: 'enum members',
                ops: {
                    length: 1,
                    0: { kind: 'replace', original: 'B', updated: 'X' },
                },
            },
            original: { label: 'data2' },
            updated: { label: 'data2' },
        },
        2: {
            kind: 'typechange',
            change: {
                kind: 'enum members',
                ops: {
                    length: 1,
                    0: { kind: 'insert', updated: 'X' },
                },
            },
            original: { label: 'data3' },
            updated: { label: 'data3' },
        },
        3: {
            kind: 'typechange',
            change: { kind: 'enum resize' },
            original: { label: 'data4' },
            updated: { label: 'data4' },
        },
    });
});
test('storage upgrade with missing enum members', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Enum_V1');
    const v2 = t.context.extractStorageLayout('StorageUpgrade_Enum_V2_Ok');
    const t_enum = Object.keys(v1.types).find(t => type_id_1.stabilizeTypeIdentifier(t) === 't_enum(Enum1)');
    if (t_enum === undefined) {
        throw new Error('Enum type not found');
    }
    // Simulate missing enum members
    v1.types[t_enum].members = undefined;
    t.like(storage_1.getStorageUpgradeErrors(v1, v2), {
        0: {
            kind: 'typechange',
            change: { kind: 'missing members' },
            original: { label: 'data1' },
            updated: { label: 'data1' },
        },
    });
    t.deepEqual(storage_1.getStorageUpgradeErrors(v1, v2, { unsafeAllowCustomTypes: true }), []);
});
test('storage upgrade with recursive type', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Recursive_V1');
    const v2 = t.context.extractStorageLayout('StorageUpgrade_Recursive_V2');
    const e = t.throws(() => storage_1.getStorageUpgradeErrors(v1, v2));
    t.true(e.message.includes('Recursion found'));
});
test('storage upgrade with contract type', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Contract_V1');
    const v2 = t.context.extractStorageLayout('StorageUpgrade_Contract_V2');
    t.deepEqual(storage_1.getStorageUpgradeErrors(v1, v2), []);
});
test('storage upgrade with arrays', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Array_V1');
    const v2_Ok = t.context.extractStorageLayout('StorageUpgrade_Array_V2_Ok');
    t.deepEqual(storage_1.getStorageUpgradeErrors(v1, v2_Ok), []);
    const v2_Bad = t.context.extractStorageLayout('StorageUpgrade_Array_V2_Bad');
    t.like(storage_1.getStorageUpgradeErrors(v1, v2_Bad), {
        length: 5,
        0: {
            kind: 'typechange',
            change: { kind: 'array shrink' },
            original: { label: 'x1' },
            updated: { label: 'x1' },
        },
        1: {
            kind: 'typechange',
            change: { kind: 'array grow' },
            original: { label: 'x2' },
            updated: { label: 'x2' },
        },
        2: {
            kind: 'typechange',
            change: { kind: 'array dynamic' },
            original: { label: 'x3' },
            updated: { label: 'x3' },
        },
        3: {
            kind: 'typechange',
            change: { kind: 'array dynamic' },
            original: { label: 'x4' },
            updated: { label: 'x4' },
        },
        4: {
            kind: 'typechange',
            change: {
                kind: 'mapping value',
                inner: { kind: 'array shrink' },
            },
            original: { label: 'm' },
            updated: { label: 'm' },
        },
    });
});
test('storage upgrade with mappings', t => {
    const v1 = t.context.extractStorageLayout('StorageUpgrade_Mapping_V1');
    const v2_Ok = t.context.extractStorageLayout('StorageUpgrade_Mapping_V2_Ok');
    t.deepEqual(storage_1.getStorageUpgradeErrors(v1, v2_Ok), []);
    const v2_Bad = t.context.extractStorageLayout('StorageUpgrade_Mapping_V2_Bad');
    t.like(storage_1.getStorageUpgradeErrors(v1, v2_Bad), {
        length: 2,
        0: {
            kind: 'typechange',
            change: {
                kind: 'mapping value',
                inner: { kind: 'obvious mismatch' },
            },
            original: { label: 'm1' },
            updated: { label: 'm1' },
        },
        1: {
            kind: 'typechange',
            change: { kind: 'mapping key' },
            original: { label: 'm2' },
            updated: { label: 'm2' },
        },
    });
});
function stabilizeStorageLayout(layout) {
    return {
        storage: layout.storage.map(s => ({ ...s, type: type_id_1.stabilizeTypeIdentifier(s.type) })),
        types: Object.entries(layout.types).map(([type, item]) => {
            const members = item.members &&
                (layout_1.isEnumMembers(item.members)
                    ? item.members
                    : item.members.map(m => ({ ...m, type: type_id_1.stabilizeTypeIdentifier(m.type) })));
            return [type_id_1.stabilizeTypeIdentifier(type), { ...item, members }];
        }),
    };
}
//# sourceMappingURL=storage.test.js.map