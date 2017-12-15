import { Document } from "mongoose";
export interface IEntity {
    getModelName: () => string;
}
