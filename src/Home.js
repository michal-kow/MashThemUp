import axios from 'axios';
import './Home.css';
import React, { useState, useEffect } from 'react';

const Home = () => {

    const CLIENT_ID = "8c6c29c661d64277be6ed05d6d7845b0"
    const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"

    const [isLoading, setIsLoading] = useState(false);
    const [songsList, setSongsList] = useState();
    const [token, setToken] = useState("");
    const [searchKey, setSearchKey] = useState("");
    const [tracks, setTracks] = useState([]);
    const [isSearchKeyEmpty, setIsSearchKeyEmpty] = useState(false);
    const [tracksInfo, setTracksInfo] = useState([]);
    const [isAfterFirstSearch, setIsAfterFirstSearch] = useState(false);

    const pitchToCamelotDictionary = {
        '01':'8B',
		'11':'3B',
		'21':'10B',
		'31':'5B',
		'41':'12B',
		'51':'7B',
		'61':'2B',
		'71':'9B',
		'81':'4B',
		'91':'11B',
		'101':'6B',
		'111':'1B',
		'00':'5A',
		'10':'12A',
		'20':'7A',
		'30':'2A',
		'40':'9A',
		'50':'4A',
		'60':'11A',
		'70':'6A',
		'80':'1A',
		'90':'8A',
		'100':'3A',
		'110':'10A'
    }

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

    const searchTracks = async (e) => {
        e.preventDefault();
        setIsAfterFirstSearch(true);
        if(searchKey) {
            setIsLoading(true);
            setIsSearchKeyEmpty(false);
            const {data} = await axios.get("https://api.spotify.com/v1/search", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    q: searchKey,
                    type: "track"
                }
            }).catch(() => {
                setTracks([]);
            })
            setIsLoading(false);
            setTracks(data.tracks.items);
        } else {
            setIsSearchKeyEmpty(true);
            setTracks([]);
        }
    }

    const getBpm = async (preparedIds) => {
        const {data} = await axios.get("https://api.spotify.com/v1/audio-features", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                ids: preparedIds,
            }
        }).catch((error) => {
            console.log(error);
        })
        return data.audio_features;
    }

    useEffect(() => {
        async function prepareTracks() {
            const songIds = tracks.map(track => track.id).join(",");
            const trackDataFromApi = await getBpm(songIds);
            setTracksInfo(trackDataFromApi);
        }
        if(tracks.length) {
            prepareTracks();
        }
    }, [tracks])

    const renderBpm = (id) => {
        if(tracksInfo.length) {
            const found = tracksInfo.find(obj => {
                return obj.id === id;
            })
            if(found) {
                return Math.round(found.tempo);
            }
        }   
    }

    const renderKey = (id) => {
        if(tracksInfo.length) {
            const found = tracksInfo.find(obj => {
                return obj.id === id;
            })
            if(found) {
                return pitchToCamelot(found.key, found.mode);
            }
        }
    }

    const pitchToCamelot = (key, mode) => {
        let input = String(key)+String(mode);
        const camelot = pitchToCamelotDictionary[input];
        return camelot;
    }

    const renderArtistsNames = (artists) => {
        let names = '';
        for (let i=0; i<artists.length; i++) {
            names+=artists[i].name;
            if(i!=artists.length-1) {
                names+=', ';
            }
        }
        return names;
    }

    function renderTracks() {
        let result;
        if (tracks.length) {
            result = tracks.map((track) => 
                <li key={track.id} className="song-item">
                    <a className='link-to-song' href="">
                        <div className="img-with-data">
                        <img src={track.album.images[0].url} alt="" />
                            <div className="title-artist">
                                <p className='song-title'>{track.name}</p>
                                <p className='song-artist'>{renderArtistsNames(track.artists)}</p>
                            </div>
                        </div>
                        <p className="tempo">{renderBpm(track.id)}</p>
                        <p className="key">{renderKey(track.id)}</p>
                    </a>
                </li>
            )
        } else {
            if(!isSearchKeyEmpty && isAfterFirstSearch) {
                result = "No data found";
            }
        }

        return result;
    }

    useEffect(() => {
        let tempo;
        let key;
        setSongsList(tracks?.error ? "No data found" : renderTracks);
    }, [tracks])

    return (
        <div className="Home">
            <div className="form">
                <form onSubmit={searchTracks}>
                    <input className='text-input' placeholder="Enter the name of the song/artist" type="text" onChange={(e) => setSearchKey(e.target.value)}/>
                    <input className='submit-btn' type="submit" value="Search" />
                    {token && isSearchKeyEmpty && <div className='search-key-empty'>The input is empty</div>}
                    
                </form>
                {!token ? 
                    <a className='log-btn' href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
                    : <button className='log-btn' onClick={logout}>Logout</button>
                }
            </div>

            <div className="output">{token ? (isLoading ? <p>Loading...</p> : 
                <ul>{songsList}</ul>) : 'Please log in'}
            </div>
        </div>
    );
}
 
export default Home;