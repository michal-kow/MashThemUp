import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import SongItem from "./SongItem";
import axios from "axios";
import './Similar.css';
import SliderComponent from "./SliderComponent";

const Similar = () => {

    const CLIENT_ID = "8c6c29c661d64277be6ed05d6d7845b0"
    const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"

    const [token, setToken] = useState("");
    const [track, setTrack] = useState({});
    const [trackInfo, setTrackInfo] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [recommendedList, setRecommendedList] = useState([]);
    const [bpmRange, setBpmRange] = useState([]);
    const [filterSubmitted, setFilterSubmitted] = useState(0);
    const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState(Array(3).fill(""));
    const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];

            window.location.hash = "";
            window.localStorage.setItem("token", token);
        }

        setToken(token);

    }, [])

    const logout = () => {
        setToken("");
        window.localStorage.removeItem("token");
    }

    useEffect(() => {
        if(token) {
            const apiRequest = async () => {
                const {data} = await axios.get("https://api.spotify.com/v1/tracks/"+songId, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).catch((e) => {
                    console.log(e);
                })
                setTrack(data);
            }

            apiRequest();
        }
    }, [token])

    const getTracksFeatures = async (trackId) => {
        const {data} = await axios.get("https://api.spotify.com/v1/audio-features", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                ids: trackId,
            }
        }).catch((error) => {
            console.log(error);
        })
        return data.audio_features;
    }

    useEffect(() => {
        async function prepareTracks() {
            const trackDataFromApi = await getTracksFeatures(track.id);
            setTrackInfo(trackDataFromApi);
            setIsLoading(false);
        }
        if(track.album) {
            prepareTracks();
        }
    }, [track])

    const getRecommendations = async (keyChange, modeChange) => {

        let keyShift;
        let modeShift;

        if (modeChange===0) {
            modeShift=0;
            if (keyChange===0) {
                keyShift=0;
            } else {
                if (keyChange===1) {
                    keyShift=7;
                } else if (keyChange===-1) {
                    keyShift=5;
                }
            }
        } else if (modeChange===1) {
            modeShift=1;
            if (trackInfo[0].mode===0) {
                keyShift=3;
            } else if (trackInfo[0].mode===1) {
                keyShift=9;
            }
        }

        const {data} = await axios.get("https://api.spotify.com/v1/recommendations", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                seed_artists: advancedFilters[0]!=="" ? advancedFilters[0] : track.artists[0].id,
                seed_genres: advancedFilters[1]!=="" ? advancedFilters[1] : "",
                seed_tracks: advancedFilters[2]!=="" ? advancedFilters[2] : track.id,
                limit: 50,
                min_key: (trackInfo[0].key+keyShift)%12,
                max_key: (trackInfo[0].key+keyShift)%12,
                min_mode: (trackInfo[0].mode+modeShift)%2,
                max_mode: (trackInfo[0].mode+modeShift)%2,
                min_tempo: bpmRange[0],
                max_tempo: bpmRange[1]
            }
        }).catch((error) => {
            console.log(error);
        })
        return data.tracks;
    }
    

    const recommendedInfo = async (tracks) => {
        const songIds = tracks.map(track => track.id).join(",");
        const trackDataFromApi = await getTracksFeatures(songIds);
        return trackDataFromApi;
    }

    useEffect(() => {
        async function waitForRecommendations() {
            setIsRecommendedLoading(true);
            let recommendationsDataFromApi = await getRecommendations(0, 0);
            recommendationsDataFromApi = [...recommendationsDataFromApi, ...await getRecommendations(-1, 0)];
            recommendationsDataFromApi = [...recommendationsDataFromApi, ...await getRecommendations(1, 0)];
            recommendationsDataFromApi = [...recommendationsDataFromApi, ...await getRecommendations(0, 1)];
            const recommendedTracksInfoFromApi = await recommendedInfo(recommendationsDataFromApi);
            const result = recommendationsDataFromApi.map((track) => <SongItem key={track.id} trackData={track} tracksArrayData={recommendedTracksInfoFromApi} />)
            setRecommendedList(result);
            setIsRecommendedLoading(false);
        }

        if(track && trackInfo && filterSubmitted!==0) {
            waitForRecommendations();
        }
    }, [trackInfo, filterSubmitted])

    function useQuery() {
        const { search } = useLocation();
        
        return React.useMemo(() => new URLSearchParams(search), [search]);
    }

    let query = useQuery();
    let songId = query.get("id");

    const getSliderValues = (values) => {
        setBpmRange([values[0], values[2]]);
    }

    return (
        <div className="Similar">
            <div className="header">
                <a href="/" className="link-to-home">Home</a>
                <div className="button">
                    {!token ? 
                        <a className='log-btn' href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
                        : <button className='log-btn' onClick={logout}>Logout</button>
                    }
                </div>
            </div>
            <div className="chosen-track">{token ? (isLoading ? <p>Loading...</p> : 
                <SongItem trackData={track} tracksArrayData={trackInfo}/>) : 'Please log in'}
            </div>
            {trackInfo && trackInfo.length && 
                <div className="search-filters">
                    <div className="slider">
                        <SliderComponent targetBpm={trackInfo[0].tempo} sendData={getSliderValues}/>
                    </div>
                    <div className={advancedFiltersVisible ? "advanced-filters visible" : "advanced-filters invisible"}>
                        <p>Type in an example of a track that has a style you're looking for:</p>
                        <div className="artist-seed-input">
                            <input type="text" placeholder="Artist" value={advancedFilters[0]} onChange={(e) => {
                                let tempArray = [...advancedFilters];
                                tempArray[0] = e.target.value;
                                setAdvancedFilters(tempArray);
                            }}/>
                        </div>
                        <div className="genre-seed-input">
                            <input type="text" placeholder="Genre" value={advancedFilters[1]} onChange={(e) => {
                                let tempArray = [...advancedFilters];
                                tempArray[1] = e.target.value;
                                setAdvancedFilters(tempArray);
                            }}/>
                        </div>
                        <div className="track-seed-input">
                            <input type="text" placeholder="Track" value={advancedFilters[2]} onChange={(e) => {
                                let tempArray = [...advancedFilters];
                                tempArray[2] = e.target.value;
                                setAdvancedFilters(tempArray);
                            }}/>
                        </div>
                    </div>
                    <button className="submit-btn" onClick={() => setFilterSubmitted(prev => prev+1)}>Find a mash-up!</button>
                    <button className={advancedFiltersVisible ? "show-advanced visible" : "show-advanced invisible"} onClick={() => setAdvancedFiltersVisible(prev => !prev)}>
                        Advanced filters
                    </button>
                </div>}
            <div className="similar-found">
                {isRecommendedLoading ? <p className="loading-similar">Loading...</p> : (recommendedList.length!==0 && recommendedList)}
            </div>
        </div>
    );
}
 
export default Similar;