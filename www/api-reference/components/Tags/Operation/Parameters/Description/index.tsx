import type { InlineCodeProps } from "@/components/InlineCode"
import MDXContentClient from "@/components/MDXContent/Client"
import type { SchemaObject } from "@/types/openapi"
import clsx from "clsx"
import dynamic from "next/dynamic"
import type { LinkProps } from "../../../../MDXComponents/Link"
import capitalize from "../../../../../utils/capitalize"

const InlineCode = dynamic<InlineCodeProps>(
  async () => import("../../../../InlineCode")
) as React.FC<InlineCodeProps>

const Link = dynamic<LinkProps>(
  async () => import("../../../../MDXComponents/Link")
) as React.FC<LinkProps>

type TagOperationParametersDescriptionProps = {
  schema: SchemaObject
}

const TagOperationParametersDescription = ({
  schema,
}: TagOperationParametersDescriptionProps) => {
  let typeDescription: React.ReactNode = <></>
  switch (true) {
    case schema.type === "object":
      typeDescription = (
        <>
          {schema.type} {schema.title ? `(${schema.title})` : ""}
          {schema.nullable ? ` or null` : ""}
        </>
      )
      break
    case schema.type === "array":
      typeDescription = (
        <>
          {schema.type === "array" && formatArrayDescription(schema.items)}
          {schema.nullable ? ` or null` : ""}
        </>
      )
      break
    case schema.anyOf !== undefined:
    case schema.allOf !== undefined:
      typeDescription = (
        <>
          {formatUnionDescription(schema.allOf)}
          {schema.nullable ? ` or null` : ""}
        </>
      )
      break
    case schema.oneOf !== undefined:
      typeDescription = (
        <>
          {schema.oneOf?.map((item, index) => (
            <span key={index}>
              {index !== 0 && <> or </>}
              {item.type !== "array" && <>{item.title || item.type}</>}
              {item.type === "array" && (
                <>array{item.items.type ? ` of ${item.items.type}s` : ""}</>
              )}
            </span>
          ))}
          {schema.nullable ? ` or null` : ""}
        </>
      )
      break
    default:
      typeDescription = (
        <>
          {schema.type}
          {schema.nullable ? ` or null` : ""}
          {schema.format ? ` <${schema.format}>` : ""}
        </>
      )
  }
  return (
    <div className={clsx("w-2/3 break-words pb-0.5 pl-0.5")}>
      {typeDescription}
      {schema.default !== undefined && (
        <>
          <br />
          <span>
            Default:{" "}
            <InlineCode className="break-words">
              {JSON.stringify(schema.default)}
            </InlineCode>
          </span>
        </>
      )}
      {schema.enum && (
        <>
          <br />
          <span>
            Enum:
            {schema.enum.map((value, index) => (
              <InlineCode key={index}>{JSON.stringify(value)}</InlineCode>
            ))}
          </span>
        </>
      )}
      {schema.example !== undefined && (
        <>
          <br />
          <span>
            Example:{" "}
            <InlineCode className="break-words">
              {JSON.stringify(schema.example)}
            </InlineCode>
          </span>
        </>
      )}
      {schema.description && (
        <>
          <br />
          <MDXContentClient
            content={capitalize(schema.description)}
            className={clsx(schema.externalDocs && "!mb-0 [&>*]:!mb-0")}
          />
        </>
      )}
      {schema.externalDocs && (
        <Link href={schema.externalDocs.url} target="_blank">
          Related guide: {schema.externalDocs.description || "Read More"}
        </Link>
      )}
    </div>
  )
}

export default TagOperationParametersDescription

function formatArrayDescription(schema?: SchemaObject) {
  if (!schema) {
    return "Array"
  }

  const type =
    schema.type === "object"
      ? `objects ${schema.title ? `(${schema.title})` : ""}`
      : `${schema.type}s`

  return `Array of ${type}`
}

function formatUnionDescription(arr?: SchemaObject[]) {
  const types = [...new Set(arr?.map((type) => type.type))]
  return <>{types.join(" or ")}</>
}
