import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import CropTable from "./components/CropTable";
import CropTableTwo from "./components/CropTableTwo";

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <CropTable />
      <CropTableTwo />
    </MantineProvider>
  );
}
