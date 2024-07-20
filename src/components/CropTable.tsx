/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, ScrollArea, Title, Container } from "@mantine/core";
import cx from "clsx";
import classes from "./CropTable.module.css";
// import * as data from '../utils/data.json'

interface CropData {
  Country: string;
  Year: string;
  CropName: string;
  CropProduction: number;
  YieldOfCrops: number;
  AreaUnderCultivation: number;
}

interface AggregatedData {
  Year: number;
  MaxProductionCrop: string;
  MinProductionCrop: string;
}

const CropTable: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [cropData, setCropData] = useState<CropData[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);

  useEffect(() => {
    // Fetch data from JSON file
    fetch("/src/utils/data.json")
      .then((response) => response.json())
      .then((data) => {
        const processedData = data.map((item) => ({
          Country: item.Country,
          Year: item.Year.match(/\d{4}/)[0],
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
      });
  }, []);

  return (
    <Container>
      <ScrollArea
        h={500}
        w={1500}
        onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
      >
        <Table miw={700}>
          <Table.Thead
            className={cx(classes.header, { [classes.scrolled]: scrolled })}
          >
            <Table.Tr>
              <Table.Th>Year</Table.Th>
              <Table.Th>Crop With maximum Production</Table.Th>
              <Table.Th>Crop With minimum Production</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {aggregatedData.map((item) => (
              <Table.Tr key={item.Year}>
                <Table.Td>{item.Year}</Table.Td>
                <Table.Td>{item.MaxProductionCrop}</Table.Td>
                <Table.Td>{item.MinProductionCrop}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Container>
  );
};

export default CropTable;
