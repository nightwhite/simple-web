"use strict"
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k
    var desc = Object.getOwnPropertyDescriptor(m, k)
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k] } }
    }
    Object.defineProperty(o, k2, desc)
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k
    o[k2] = m[k]
}))
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v })
}) : function (o, v) {
    o["default"] = v
})
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
}
Object.defineProperty(exports, "__esModule", { value: true })
const _ = __importStar(require("lodash"))
function arrayUtils(arr) {
    return {
        unique: _.uniq(arr),
        chunks: _.chunk(arr, 2),
        sorted: _.sortBy(arr)
    }
}
function objectUtils(obj) {
    return {
        keys: _.keys(obj),
        values: _.values(obj),
        flattened: _.flattenDeep(obj)
    }
}
async function default_1(ctx) {
    const testArray = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    const testObject = { a: 1, b: [2, 3], c: { d: 4 } }
    return {
        arrayResults: arrayUtils(testArray),
        objectResults: objectUtils(testObject)
    }
}
exports.default = default_1
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBDQUEyQjtBQUczQixTQUFTLFVBQVUsQ0FBQyxHQUFVO0lBQzFCLE9BQU87UUFDSCxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDbkIsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN2QixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7S0FDeEIsQ0FBQTtBQUNMLENBQUM7QUFHRCxTQUFTLFdBQVcsQ0FBQyxHQUFXO0lBQzVCLE9BQU87UUFDSCxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDakIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ3JCLFNBQVMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztLQUNoQyxDQUFBO0FBQ0wsQ0FBQztBQUVjLEtBQUssb0JBQVcsR0FBb0I7SUFDL0MsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbkQsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQTtJQUVuRCxPQUFPO1FBQ0gsWUFBWSxFQUFFLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDbkMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUM7S0FDekMsQ0FBQTtBQUNMLENBQUM7QUFSRCw0QkFRQyJ9