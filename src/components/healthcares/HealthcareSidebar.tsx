import useFetch from "@/lib/hooks/useFetch";
import { useCallback, useEffect, useState } from "react";
import GenericTable from "../ui/GenericTable";
import Button from "../ui/Button";
import { BsPlus } from "react-icons/bs";
import Modal from "../ui/Modal";
import AddCoverageModal from "./AddCoverageModal";

type HealthcareSidebarProps = {
  id: string;
};
const HealthcareSidebar = ({ id }: HealthcareSidebarProps) => {
  const [data, setData] = useState<Record<string, any> | null>(null);

  const { fetchData, fetched } = useFetch();

  const getSidebarData = useCallback(async () => {
    const response = await fetchData(
      `/coverages/healthcare/${id ?? ""}`,
      "GET"
    );
    setData(response);
  }, []);
  useEffect(() => {
    if (!fetched) {
      getSidebarData();
    }
  }, [getSidebarData, fetched]);
  if (data) {
    return (
      <div>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold py-2">{data.healthcare.name}</h1>
          <AddCoverageModal refetch={() => {}} healthcareId={id} />
        </div>
        <div>
          <GenericTable
            items={data.coverages}
            columns={[
              { name: "Servicio", key: "service.name" },
              { name: "Cobertura", key: "amount", prefix: "$" },
              { name: "Co-seguro segun OS", key: "copay", prefix: "$" },
            ]}
            lastColumnName="Co-seguro"
            lastColumn={(item: any) => (
              <td className="py-2 px-2">
                ${Math.max(item.service.price - item.amount, 0)}
              </td>
            )}
          />
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default HealthcareSidebar;
