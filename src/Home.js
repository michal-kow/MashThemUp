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
    const [Bpm, setBpm] = useState();
    const [Key, setKey] = useState('');

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

    // const getBpm = async (id) => {
    //     const {data} = await axios.get("https://api.spotify.com/v1/audio-features", {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         },
    //         params: {
    //             ids: id,
    //         }
    //     }).catch((error) => {
    //         console.log(error);
    //     })
    //     console.log(data);
    //     // console.log('test');
    //     // return Math.round(data[0]?.audio_features[0].tempo);
    //     return 'dziala';
    // }

    function renderTracks() {
        return tracks?.map((track) => 
            <li key={track.id} className="song-item">
                <a className='link-to-song' href="">
                    <div className="img-with-data">
                    <img src={track.album.images[0].url} alt="" />
                        <div className="title-artist">
                            <p className='song-title'>{track.name}</p>
                            <p className='song-artist'>{track.artists[0].name}</p>
                            {/* TODO: add all artists' names */}
                        </div>
                    </div>
                    {/* <p className="tempo">{tempo}</p> */}
                    {/* <p className="key">{songData.key_of ? songData.key_of : ''}</p> */}
                </a>
            </li>
        )

        // const promises = tracks?.map(async track => {
        //     const response = await axios.get("https://api.spotify.com/v1/audio-features", {
        //         headers: {
        //             Authorization: `Bearer ${token}`
        //         },
        //         params: {
        //             ids: track.id,
        //         }
        //     }).catch((error) => {
        //         console.log(error);
        //     })
        //     return response;
        // })

        // const results = await Promise.all(promises);
        // console.log(results);

        // return <div>test</div>;
    }

    useEffect(() => {
        let tempo;
        let key;
        setSongsList(tracks?.error ? "No data found" : renderTracks)
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