/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Container,ScrollArea, Title } from "@mantine/core";
import cx from "clsx";
import classes from "./CropTable.module.css";

interface CropData {
  Country: string;
  Year: string;
  CropName: string;
  CropProduction: number;
  YieldOfCrops: number;
  AreaUnderCultivation: number;
}

interface AggregatedData {
  Year: string;
  MaxProductionCrop: string;
  MinProductionCrop: string;
}

interface CropStats {
  CropName: string;
  AverageYield: number;
  AverageArea: number;
}

const CropTableTwo: React.FC = () => {
    const [scrolled, setScrolled] = useState<boolean>(false)
  const [cropData, setCropData] = useState<CropData[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  const [cropStats, setCropStats] = useState<CropStats[]>([]);

  useEffect(() => {
    // Fetch data from local JSON file
    fetch("/src/utils/data.json")
      .then((response) => response.json())
      .then((data) => {
        const processedData = data.map((item: any) => ({
          Country: item.Country,
          Year: item.Year.match(/\d{4}/)[0], // Extracts the year part
          CropName: item["Crop Name"],
          CropProduction: item["Crop Production (UOM:t(Tonnes))"]
            ? parseFloat(item["Crop Production (UOM:t(Tonnes))"])
            : 0,
          YieldOfCrops: item["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"]
            ? parseFloat(item["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"])
            : 0,
          AreaUnderCultivation: item[
            "Area Under Cultivation (UOM:Ha(Hectares))"
          ]
            ? parseFloat(item["Area Under Cultivation (UOM:Ha(Hectares))"])
            : 0,
        }));

        setCropData(processedData);

        // Aggregate data by year
        const aggregated: AggregatedData[] = [];
        const years = [
          ...new Set(processedData.map((item: CropData) => item.Year)),
        ];

        years.forEach((year) => {
          const cropsInYear = processedData.filter(
            (item: CropData) => item.Year === year
          );
          let maxProduction = 0;
          let minProduction = Number.MAX_VALUE;
          let maxProductionCrop = "";
          let minProductionCrop = "";

          cropsInYear.forEach((crop: CropData) => {
            if (crop.CropProduction > maxProduction) {
              maxProduction = crop.CropProduction;
              maxProductionCrop = crop.CropName;
            }
            if (crop.CropProduction < minProduction) {
              minProduction = crop.CropProduction;
              minProductionCrop = crop.CropName;
            }
          });

          aggregated.push({
            Year: year,
            MaxProductionCrop: maxProductionCrop,
            MinProductionCrop: minProductionCrop,
          });
        });

        setAggregatedData(aggregated);

        // Aggregate data by crop
        const cropNames = [
          ...new Set(processedData.map((item) => item.CropName)),
        ];
        const stats: CropStats[] = [];

        cropNames.forEach((cropName) => {
          const crops = processedData.filter(
            (item: CropStats) => item.CropName === cropName
          );
          const totalYield = crops.reduce(
            (sum, crop) => sum + crop.YieldOfCrops,
            0
          );
          const totalArea = crops.reduce(
            (sum, crop) => sum + crop.AreaUnderCultivation,
            0
          );
          const averageYield = totalYield / crops.length;
          const averageArea = totalArea / crops.length;

          stats.push({
            CropName: cropName,
            AverageYield: averageYield,
            AverageArea: averageArea,
          });
        });

        setCropStats(stats);
      });
  }, []);

  return (
    <Container>
      <ScrollArea
        h={500}
        w={1500}
        onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
      >
        <Title order={2} style={{ marginTop: "2rem" }}>
          Crop Statistics (1950-2020)
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Crop Name</Table.Th>
              <Table.Th>Average Yield (Kg/Ha)</Table.Th>
              <Table.Th>Average Cultivation Area (Ha)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {cropStats.map((item) => (
              <Table.Tr key={item.CropName}>
                <Table.Td>{item.CropName}</Table.Td>
                <Table.Td>{item.AverageYield.toFixed(3)}</Table.Td>
                <Table.Td>{item.AverageArea.toFixed(3)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Container>
  );
};

export default CropTableTwo;
