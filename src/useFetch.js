import { useState, useEffect } from "react";

export default function useFetch(url, dataField) {
  const [data, setData] = useState();
  const [error, setError] = useState();
  const axios = require("axios");
  useEffect(() => {
    function getAllData() {
      let dataFetched = [];
      return axios(url)
        .then(async (response) => {
          dataFetched = await response.data.result.records;

          return response.data.count;
        })
        .then((count) => {
          let promises = [];

          for (let i = 100; i <= 1000; i = i + 100) {
            promises.push(axios(`${url}&offset=${i}`));
          }

          return Promise.all(promises);
        })
        .then((response) => {
          dataFetched = response.reduce(
            (acc, data) => [...acc, ...data.data.result.records],
            dataFetched
          );

          setData(dataFetched);
        })
        .catch((err) => setError(`${err} `));
    }
    getAllData();
  }, []);

  return { data, error };
}
