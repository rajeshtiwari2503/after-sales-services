export function assignBestTechnician(
  technicians: any[],
  category: string
) {
  const filtered =
    technicians.filter(
      (tech) =>
        tech.skills?.includes(
          category
        )
    );

  return (
    filtered[0] ||
    technicians[0]
  );
}