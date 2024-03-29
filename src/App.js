import React, { useState, useEffect } from 'react';
import { useWeb3React } from "@web3-react/core";
import axios from 'axios';
import { Link } from 'react-router-dom';

import { injected } from "./connectors";
import TraitSelector from './TraitSelector';
import traits from './constant';
import './App.css';

// const BASE_URL = 'http://localhost:8000/api';
const BASE_URL = 'https://xphunk-backend.herokuapp.com/api';

function App(props) {
  const [isShowFilter, setShowFilter] = useState(false);
  const [isShowConnectWallet, setShowConnectWallet] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [data, setData] = useState(false);
  const [filteredData, setFilteredData] = useState(false);
  const [isSaleXphunk, setIsSaleXphunk] = useState(true);
  const [isSaleOpensea, setIsSaleOpensea] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [lazyData, setLazyData] = useState([]);
  const { active, account, library, connector, activate, deactivate } = useWeb3React()

  useEffect(async () => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage?.getItem('isWalletConnected') === 'true') {
        try {
          await activate(injected)
          localStorage.setItem('isWalletConnected', true)
        } catch (ex) {
          console.log(ex)
        }
      }
    }
    connectWalletOnPageLoad()
  }, []);

  useEffect(() => {
    var temp_trait = [];
    for (var i = 0; i < traits.length; i++) {
      temp_trait.push(traits[i].trait_type);
    }
    setSelectedTraits(temp_trait)
    handleFilterData();

    let _lazyData = [];
    for (let i = 10000; i < 12000; i++) {
      _lazyData.push(<Link key={i} className="phunk-item-link" to={'/details/' + i}>
        <div className="phunk-item">
          <img className="phunk-image" alt='' src="./flip.gif" />
        </div>
        <div className="labels-wrapper">
          <div className="phunk-label-detail">#{i}</div>
        </div>
      </Link>
      );
    }
    setLazyData(_lazyData);
  }, []);

  useEffect(() => {
    if (searchValue) {
      handleSearch(searchValue);
    }
  }, [filteredData]);

  useEffect(() => {
    handleFilterData();
  }, [isSaleXphunk, isSaleOpensea]);

  async function connect() {
    try {
      await activate(injected)
      localStorage.setItem('isWalletConnected', true)

    } catch (ex) {
      console.log(ex)
    }
  }

  async function disconnect() {
    try {
      deactivate()
      localStorage.setItem('isWalletConnected', false)
    } catch (ex) {
      console.log(ex)
    }
  }

  const handleTraitChange = (e, index) => {

    var temp_trait = selectedTraits;
    if (e) {
      temp_trait[index] = e.value;
    } else {
      temp_trait[index] = null;
    }

    setSelectedTraits(temp_trait);
    handleFilterData();
  };

  const handleTraitClear = (index) => {
    var temp_trait = selectedTraits;
    temp_trait[index] = traits[index].trait_type;
    setSelectedTraits(temp_trait);
    handleFilterData();
  };

  const handleSortButton = () => {
    setShowFilter(!isShowFilter);
  };

  const handleFilterData = async () => {
    setLoading(true);
    const params = {
      "traitAttributeCount": selectedTraits[0] === "Attribute Count" ? null : selectedTraits[0],
      "traitBlemish": selectedTraits[1] === "Blemish" ? null : selectedTraits[1],
      "traitEar": selectedTraits[2] === "Ear" ? null : selectedTraits[2],
      "traitEyes": selectedTraits[3] === "Eyes" ? null : selectedTraits[3],
      "traitFacialHair": selectedTraits[4] === "Facial Hair" ? null : selectedTraits[4],
      "traitHair": selectedTraits[5] === "Hair" ? null : selectedTraits[5],
      "traitMouth": selectedTraits[6] === "Mouth" ? null : selectedTraits[6],
      "traitMouthProp": selectedTraits[7] === "Mouth Prop" ? null : selectedTraits[7],
      "traitNeckAccessory": selectedTraits[8] === "Neck Accessory" ? null : selectedTraits[8],
      "traitNose": selectedTraits[9] === "Nose" ? null : selectedTraits[9],
      "traitSkinTone": selectedTraits[10] === "Skin Tone" ? null : selectedTraits[10],
      "traitType": selectedTraits[11] === "Type" ? null : selectedTraits[11],
      "isSaleXphunk": isSaleXphunk === false ? null : 1,
      "isSaleOpensea": isSaleOpensea === false ? null : 1,
    };

    const res = await axios.get(BASE_URL, { params });
    setData(res.data);
    setFilteredData(res.data);
    setLoading(false);
  };

  const handleShowHideWallet = () => {
    setShowConnectWallet(!isShowConnectWallet);
  };

  const handleSearch = async (value) => {
    setSearchValue(value);
    const result = filteredData.filter(function (row) {
      const nameArr = row.name.split("#");
      const number = nameArr[nameArr.length - 1];
      if (number.search(value) >= 0) {
        return true;
      } else {
        return false;
      }
    });

    setData(result);
  }

  const changeIsSale = async (index) => {
    if (index == 0) {
      setIsSaleXphunk(!isSaleXphunk);
    } else {
      setIsSaleOpensea(!isSaleOpensea);
    }
  };

  return (
    <div className="App" >
      <div className="post-header-wrapper">
        <h1>Expansion Phunks Marketplace</h1>
        <h2>{!isLoading && data ? data.length : 0}/10000 xPhunks Total</h2>
      </div>
      <div className="search">
        <input className="search-input" type="text" onChange={e => handleSearch(e.target.value)} />
      </div>
      <div className="filter">
        <div className="isSale">
          <input type="checkbox" onChange={e => changeIsSale(0)} checked={isSaleXphunk} /> XPhunk Marketplace
        </div>
        <div className="isSale">
          <input type="checkbox" onChange={e => changeIsSale(1)} checked={isSaleOpensea} /> Opensea
        </div>
        <button className="filter-button" onClick={handleSortButton}>
          {isShowFilter ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {isShowFilter && <TraitSelector
        selectedTraits={selectedTraits}
        handleTraitChange={handleTraitChange}
        handleTraitClear={handleTraitClear}
      />}
      {
        isLoading ? (
          <div className="listings-wrapper">
            {lazyData}
          </div>
        ) :
          <div className="listings-wrapper">
            {data && data.map((item, index) => (
              <Link key={index} className="phunk-item-link" to={`/details/${item.name.split('#')[1]}`} state={{ data: item }}>
                <div className="phunk-item">
                  <img className="phunk-image" alt='' src={item.image} />
                </div>
                <div className="labels-wrapper">
                  <div className="phunk-label-detail">{item.name.split(' ')[1]}</div>
                </div>
              </Link>
            ))}
          </div>
      }
      <div className={isShowConnectWallet ? "connect-wallet" : "connect-wallet hide-modal"}>
        <h3 className="hide-show" onClick={handleShowHideWallet}>{isShowConnectWallet ? "hide" : "show"}</h3>
        <h3 className={active ? "min-y-margin" : "middle-y-margin"}>{active ? "Connected To Ethereum" : "Ethereum Available"}</h3>
        <h4 className="min-y-margin full-address">{active && account}</h4>
        <h4 className="min-y-margin short-address">{active && account.slice(0, 15) + "..."}</h4>
        {active && <button className={active ? "min-y-margin connect-button" : "middle-y-margin connect-button"} onClick={disconnect}>Disconnect</button>}
        {!active && <h3 className={active ? "min-y-margin connect-button" : "middle-y-margin connect-button"} onClick={connect}>Connect to MetaMask</h3>}
      </div>
    </div>
  );
}

export default App;