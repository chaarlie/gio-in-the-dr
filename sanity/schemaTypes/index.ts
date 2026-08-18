import type { SchemaTypeDefinition } from "sanity";
import { guide } from "./guide";
import { neighborhood } from "./neighborhood";
import { post } from "./post";
import { property } from "./property";

export const schemaTypes: SchemaTypeDefinition[] = [neighborhood, property, post, guide];
