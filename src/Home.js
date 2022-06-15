import axios from 'axios';
import './Home.css';
import React, { useState, useEffect } from 'react';

const Home = () => {

    const apiKey = '06e98beee4f264d64e23c9bf40a04cf7';

    const [searchType, setSearchType] = useState('');
    const [inputArtist, setInputArtist] = useState('');
    const [inputTitle, setInputTitle] = useState('');
    const [searchLookup, setSearchLookup] = useState('');
    const [submitted, setSubmitted] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [songsList, setSongsList] = useState();

    useEffect(() => {
        if(searchType) {
            setIsLoading(true);
            console.log('https://api.getsongbpm.com/search/?api_key='+apiKey+'&type='+searchType+'&lookup='+searchLookup);
            axios.get('https://api.getsongbpm.com/search/?api_key='+apiKey+'&type='+searchType+'&lookup='+searchLookup).then(res => {
                setIsLoading(false);
                console.log(res.data);
                setData(res.data.search);
            }).catch(error => {
                console.log(error);
                setIsLoading(false);
            })
        }
    },[submitted])

    const handleSearch = (e) => {
        e.preventDefault();
        let title = inputTitle.replace(/\s/g, '+');
        let artist = inputArtist.replace(/\s/g, '+');
        if(inputArtist && inputTitle) {
            setSearchType('both');
            setSearchLookup('song:'+title+'+artist:'+artist);
        } else if(inputArtist && !inputTitle) {
            setSearchType('artist');
            setSearchLookup(artist);
        } else if(!inputArtist && inputTitle) {
            setSearchType('song');
            setSearchLookup(title);
        }
        setSubmitted((prev) => prev+1);
    }

    useEffect(() => {
        setSongsList(data?.error ? "No data found" : data?.map((songData) => 
            <li key={songData.id ? songData.id : songData.song_id} className="song-item">
                <a className='link-to-song' href="">
                    <div className="img-with-data">
                    <img src={songData.album?.img} alt="" />
                        <div className="title-artist">
                            <p className='song-title'>{songData.title ? songData.title : songData.song_title}</p>
                            <p className='song-artist'>{songData.name ? songData.name : songData.artist.name}</p>
                        </div>
                    </div>
                    <p className="tempo">{songData.tempo ? songData.tempo : 'TODO'}</p>
                    <p className="key">{songData.key_of ? songData.key_of : 'TODO'}</p>
                </a>
            </li>
        ))
    },[data])

    return (
        <div className="Home">
            <div className="form">
                <form onSubmit={handleSearch}>
                    <p>Artist</p>
                    <input type="text" name="artist" value={inputArtist} onChange={(e) => setInputArtist(e.target.value)}/>
                    <p>Title</p>
                    <input type="text" name="title" value={inputTitle} onChange={(e) => setInputTitle(e.target.value)}/>
                    <input className='submit-btn' type="submit" value="Search" />
                </form>
            </div>
            <div className="output">{isLoading ? <p>Loading...</p> : 
                <ul>{songsList}</ul>}
            </div>
        </div>
    );
}
 
export default Home;