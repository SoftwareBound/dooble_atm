import "./App.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
  MapConsumer,
} from "react-leaflet";
import _ from "loadsh";
import Axios from "axios";
import { useState, useRef } from "react";

const App = () => {
  const [atmList, setAtmList] = useState([]);
  const [map, setMap] = useState();
  const animateRef = useRef(true);

  const constans = {
    searchURL:
      "https://data.gov.il/api/3/action/datastore_search?resource_id=b9d690de-0a9c-45ef-9ced-3e5957776b26",
  };

  const searchATM = async (city) => {
    if (!city.target.value.length) {
      setAtmList([]);
      map.setView([32.04361422815827, 34.90258351636365], 7);

      return;
    }
    try {
      function getAllData() {
        let dataFetched = [];
        return Axios(`${constans.searchURL}&q=${city.target.value}`)
          .then(async (response) => {
            dataFetched = await response.data.result.records;

            return response.data.count;
          })
          .then(() => {
            let promises = [];

            for (let i = 100; i <= 1000; i = i + 100) {
              promises.push(
                Axios(
                  `${constans.searchURL}&q=${city.target.value}&offset=${i}`
                )
              );
            }

            return Promise.all(promises);
          })
          .then((response) => {
            dataFetched = response.reduce(
              (acc, data) => [...acc, ...data.data.result.records],
              dataFetched
            );

            setAtmList(dataFetched);
          })
          .catch((err) => alert(`${err} `));
      }
      getAllData();
    } catch (e) {
      alert(e);
    }
  };
  const SetViewOnClick = ({ animateRef }) => {
    const map = useMapEvent("click", (e) => {
      map.setView(e.latlng, map.getZoom(), {
        animate: animateRef.current || false,
      });
    });
    return null;
  };
  return (
    <div className="container main">
      <div className="row">
        <div className="col">
          <MapContainer
            center={[32.04361422815827, 34.90258351636365]}
            zoom={7}
            scrollWheelZoom={true}
            whenCreated={setMap}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {atmList &&
              atmList.map((atm) => {
                return (
                  <Marker
                    key={atm._id}
                    position={[
                      atm.X_Coordinate ? atm.X_Coordinate : 32,
                      atm.Y_Coordinate ? atm.Y_Coordinate : 34,
                    ]}
                  >
                    <Popup>
                      <h6>{atm.Bank_Name}</h6>
                      <p>
                        {atm.ATM_Address}, {atm.City}
                      </p>
                    </Popup>
                  </Marker>
                );
              })}
            <SetViewOnClick animateRef={animateRef} />
            <MapConsumer>
              {(map) => {
                let ATMLocation =
                  atmList &&
                  atmList.filter((atm) => {
                    return atm.X_Coordinate > 30 && atm.X_Coordinate < 34;
                  });
                ATMLocation &&
                  ATMLocation[0] &&
                  map.setView(
                    [ATMLocation[0].X_Coordinate, ATMLocation[0].Y_Coordinate],
                    11
                  );
                return null;
              }}
            </MapConsumer>
          </MapContainer>
        </div>
        <div className="col right_side">
          <input
            className="input_box"
            type="search"
            onChange={_.debounce(searchATM, 1000)}
            placeholder="נא לרשום את העיר בה תרצו לראות את הכספומטים"
          />
          <div className="atm_list">
            {atmList &&
              atmList.map((atm) => {
                return (
                  <div
                    className="atm_item"
                    key={atm._id}
                    onClick={() =>
                      map.setView([atm.X_Coordinate, atm.Y_Coordinate], 15)
                    }
                  >
                    <div className="row atms_list">
                      <span className="bank_name_title">{atm.Bank_Name}</span>
                    </div>
                    <div className="row">
                      <span className="col">
                        {`${atm.ATM_Address} | ${atm.ATM_Type}`}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
