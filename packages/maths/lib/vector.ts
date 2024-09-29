import type {
    TVector,
} from "./types"

export enum Direction {
    North,
    Northeast,
    East,
    Southeast,
    South,
    Southwest,
    West,
    Northwest,
}

export class Vector implements TVector {
    /**
     * A vector with both x and y components set to zero.
     *
     * @returns A vector with coordinates (0, 0).
     */
    public static get Zero(): Vector {
        return new Vector( 0,  0)
    }

    /**
     * A vector pointing upward.
     *
     * @returns A vector with coordinates (0, -1).
     */
    public static get Up(): Vector {
        return new Vector( 0, -1)
    }

    /**
     * A vector pointing left.
     *
     * @returns A vector with coordinates (-1, 0).
     */
    public static get Left(): Vector {
        return new Vector(-1,  0)
    }

    /**
     * A vector pointing downward.
     *
     * @returns A vector with coordinates (0, 1).
     */
    public static get Down(): Vector {
        return new Vector( 0,  1)
    }

    /**
     * A vector pointing right.
     *
     * @returns A vector with coordinates (1, 0).
     */
    public static get Right(): Vector {
        return new Vector( 1,  0)
    }

    /**
     * A vector pointing up and to the left.
     *
     * @returns A vector with coordinates (-sqrt(2), -sqrt(2)).
     */
    public static get UpLeft(): Vector {
        return (new Vector(-1, -1)).unit
    }

    /**
     * A vector pointing up and to the right.
     *
     * @returns A vector with coordinates (sqrt(2), -sqrt(2)).
     */
    public static get UpRight(): Vector {
        return (new Vector(1, -1)).unit
    }

    /**
     * A vector pointing down and to the right.
     *
     * @returns A vector with coordinates (sqrt(2), sqrt(2)).
     */
    public static get DownRight(): Vector {
        return (new Vector(1, 1)).unit
    }

    /**
     * A vector pointing down and to the left.
     *
     * @returns A vector with coordinates (-sqrt(2), sqrt(2)).
     */
    public static get DownLeft(): Vector {
        return (new Vector(-1, 1)).unit
    }

    /**
     * Converts a given direction into its corresponding vector.
     *
     * @param direction - The direction to convert.
     * @returns The vector corresponding to the given direction.
     *
     * @example
     * ```typescript
     * const vector = Vector.FromDirection(Direction.North);
     * console.log(vector); // Outputs: Vector.Up
     * ```
     */
    public static FromDirection(direction: Direction): Vector {
        switch (direction) {
        case Direction.North:
            return Vector.Up

        case Direction.Northeast:
            return Vector.UpRight

        case Direction.East:
            return Vector.Right

        case Direction.Southeast:
            return Vector.DownRight

        case Direction.South:
            return Vector.Down

        case Direction.Southwest:
            return Vector.DownLeft

        case Direction.West:
            return Vector.Left

        case Direction.Northwest:
            return Vector.UpLeft
        }

        const exhaustiveCheck_: never = direction
        return exhaustiveCheck_
    }

    /**
     * Creates a new `Vector` instance from an existing `TVector` object.
     *
     * @param v - A vector.
     * @returns A new Vector instance with the provided coordinates.
     */
    public static FromVector({ x, y }: TVector): Vector {
        return new Vector(x, y)
    }

    /**
     * Creates an instance of a vector with specified x and y coordinates.
     * 
     * @param x - The x-coordinate of the vector.
     * @param y - The y-coordinate of the vector.
     */
    public constructor(
        /**
         * The x-coordinate of the vector.
         */
        public x: number,
        /**
         * The y-coordinate of the vector.
         */
        public y: number,
    ) { }

    /**
     * The Euclidean norm of the vector.
     *
     * @returns The Euclidean norm of the vector.
     */
    public get norm(): number {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }

    /**
     * Gets the opposite vector of the vector.
     *
     * @returns The opposite vector.
     */
    public get opposite(): Vector {
        return Vector.FromVector(this).mutMul(-1)
    }

    /**
     * Returns the unit vector (a vector with a magnitude of 1) in the same
     * direction as the current vector.
     *
     * @returns The unit vector colinear to this.
     */
    public get unit(): Vector {
        return Vector.FromVector(this).mutMul(1/this.norm)
    }

    /**
     * Mutates the current vector by adding the given vector to it.
     *
     * @param v - The vector to add.
     * @returns this.
     */
    public mutAdd({ x, y }: TVector): Vector {
        this.x += x
        this.y += y
        return this
    }

    /**
     * Adds the given vector to the current vector and returns a new vector
     * with the result.
     *
     * @param v - The vector to add.
     * @returns A new vector that is the result of the addition.
     */
    public add(v: TVector): Vector {
        return Vector.FromVector(this).mutAdd(v)
    }

    /**
     * Mutates the current vector by substracting the given vector to it.
     *
     * @param v - The vector to subtract.
     * @returns this.
     */
    public mutSub({ x, y }: TVector): Vector {
        this.x -= x
        this.y -= y
        return this
    }

    /**
     * Subtracts the given vector from the current vector and returns a new 
     * vector with the result.
     *
     * @param v - The vector to subtract.
     * @returns A new vector that is the result of the subtraction.
     */
    public sub(v: TVector): Vector {
        return Vector.FromVector(this).mutSub(v)
    }

    /**
     * Mutates the current vector by multiplying it by the given scalar.
     *
     * @param k - The scalar value to multiply the vector by.
     * @returns this.
     */
    public mutMul(k: number): Vector {
        this.x *= k
        this.y *= k
        return this
    }

    /**
     * Multiplies the current vector by a scalar value and returns a new 
     * vector with the result.
     *
     * @param k - The scalar value to multiply the vector by.
     * @returns A new vector that is the result of the multiplication.
     */
    public mul(k: number): Vector {
        return Vector.FromVector(this).mutMul(k)
    }
}