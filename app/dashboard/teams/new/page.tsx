import { CreateTeamForm } from "../create-team-form"

export default async function CreateTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ parent?: string }>
}) {
  const { parent } = await searchParams

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">
        {parent ? "Create Department" : "Create Team"}
      </h1>
      <CreateTeamForm parentTeamId={parent} />
    </div>
  )
}
