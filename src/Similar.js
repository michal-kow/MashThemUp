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
    const [filterValues, setFilterValues] = useState([]);

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

    const getRecommendations = async () => {
        const {data} = await axios.get("https://api.spotify.com/v1/recommendations", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                seed_artists: track.artists[0].id,
                seed_genres: "dubstep",
                seed_tracks: track.id,
                limit: 50,
                min_key: (trackInfo[0].key)%12,
                max_key: (trackInfo[0].key)%12,
                min_mode: (trackInfo[0].mode)%2,
                max_mode: (trackInfo[0].mode)%2,
                min_tempo: trackInfo[0].tempo-0.2*trackInfo[0].tempo,
                max_tempo: trackInfo[0].tempo+0.2*trackInfo[0].tempo
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
            const recommendationsDataFromApi = await getRecommendations();
            const recommendedTracksInfoFromApi = await recommendedInfo(recommendationsDataFromApi);
            const result = recommendationsDataFromApi.map((track) => <SongItem key={track.id} trackData={track} tracksArrayData={recommendedTracksInfoFromApi} />)
            setRecommendedList(result);
        }

        if(track && trackInfo) {
            waitForRecommendations();
        }
    }, [trackInfo])

    function useQuery() {
        const { search } = useLocation();
        
        return React.useMemo(() => new URLSearchParams(search), [search]);
    }

    let query = useQuery();
    let songId = query.get("id");

    const getSliderValues = (values) => {
        console.log(values);
    }

    return (
        <div className="Similar">
            <div className="button">
                {!token ? 
                    <a className='log-btn' href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
                    : <button className='log-btn' onClick={logout}>Logout</button>
                }
            </div>
            <div className="chosen-track">{token ? (isLoading ? <p>Loading...</p> : 
                <SongItem trackData={track} tracksArrayData={trackInfo}/>) : 'Please log in'}
            </div>
            {trackInfo && trackInfo.length && 
                <div className="search-filters">
                    <div className="slider">
                        <SliderComponent targetBpm={trackInfo[0].tempo} sendData={getSliderValues}/>
                    </div>
                    <div className="keys">
                        <button className="key-filter">{trackInfo[0].key}</button>
                        <button className="key-filter"></button>
                        <button className="key-filter"></button>
                        <button className="key-filter"></button>
                    </div>
                    <button className="submit-btn">Find a mash-up!</button>
                </div>}
            <div className="similar-found">
                {recommendedList.length!==0 ? recommendedList : "Loading..."}
            </div>
        </div>
    );
}
 
export default Similar;