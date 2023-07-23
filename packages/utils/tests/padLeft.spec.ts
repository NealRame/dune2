import {
    expect,
} from "chai"

import {
    padLeft,
} from "../lib"

describe("padLeft", () => {
    it("should be a function", () => {
        expect(padLeft).to.be.a("function")
    })
    it("should return a new string if the targeted length is greater", () => {
        const original = "foo"
        const padded = padLeft(original, 5, "x")
        expect(padded).to.not.equals(original)
        expect(padded.length).to.equal(5)
    })
    it("should return a copy of the original string if the targeted length is shorter", () => {
        const original = "foo"
        const padded = padLeft(original, 2, "x")
        expect(padded).to.equal(original)
    })
    it("should pad the string with the given character", () => {
        const original = "foo"
        const padded = padLeft(original, 5, "x")
        expect(padded).to.equal("xxfoo")
    })
    it("may truncate the pad string to match the targeted length", () => {
        const original = "foo"
        const padded = padLeft(original, 5, "xxxxx")
        expect(padded).to.equal("xxfoo")
    })
})