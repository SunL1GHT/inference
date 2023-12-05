import React, { useContext, useState, useEffect } from "react";
import RerankCard from "./rerankCard";
import { Box, TextField, FormControl } from "@mui/material";
import { ApiContext } from "../../components/apiContext";

const LaunchRerank = () => {
  let endPoint = useContext(ApiContext).endPoint;
  const [registrationData, setRegistrationData] = useState([]);
  const { isCallingApi, setIsCallingApi } = useContext(ApiContext);
  const { isUpdatingModel } = useContext(ApiContext);

  // States used for filtering
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filter = (registration) => {
    if (!registration || typeof searchTerm !== "string") return false;
    const modelName = registration.model_name
      ? registration.model_name.toLowerCase()
      : "";
    return modelName.includes(searchTerm.toLowerCase());
  };

  const update = async () => {
    if (isCallingApi || isUpdatingModel) return;

    try {
      setIsCallingApi(true);

      const response = await fetch(
        `${endPoint}/v1/model_registrations/rerank`,
        {
          method: "GET",
        },
      );

      const registrations = await response.json();
      const newRegistrationData = await Promise.all(
        registrations.map(async (registration) => {
          const desc = await fetch(
            `${endPoint}/v1/model_registrations/rerank/${registration.model_name}`,
            {
              method: "GET",
            },
          );

          return {
            ...(await desc.json()),
            is_builtin: registration.is_builtin,
          };
        }),
      );

      setRegistrationData(newRegistrationData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsCallingApi(false);
    }
  };

  useEffect(() => {
    update();
    // eslint-disable-next-line
  }, []);

  const style = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    paddingLeft: "2rem",
    gridGap: "2rem 0rem",
  };

  return (
    <Box m="20px">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          margin: "30px 2rem",
        }}
      >
        <FormControl variant="outlined" margin="normal">
          <TextField
            id="search"
            type="search"
            label="Search for rerank model name"
            value={searchTerm}
            onChange={handleChange}
            size="small"
          />
        </FormControl>
      </div>
      <div style={style}>
        {registrationData
          .filter((registration) => filter(registration))
          .map((filteredRegistration) => (
            <RerankCard url={endPoint} modelData={filteredRegistration} />
          ))}
      </div>
    </Box>
  );
};

export default LaunchRerank;