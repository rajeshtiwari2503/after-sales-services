interface PageProps {
  params: {
    id: string;
  };
}

export default function TechnicianJobDetailsPage({
  params,
}: PageProps) {
  return (
    <div>
      Job ID: {params.id}
    </div>
  );
}