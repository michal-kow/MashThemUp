import axios from 'axios';
import React, { useState, useEffect } from 'react';

const Home = () => {

    const apiKey = '06e98beee4f264d64e23c9bf40a04cf7';

    const [searchType, setSearchType] = useState('');
    const [inputArtist, setInputArtist] = useState('');
    const [inputTitle, setInputTitle] = useState('');
    const [searchLookup, setSearchLookup] = useState('');
    const [submitted, setSubmitted] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    const [songsList, setSongsList] = useState();

    useEffect(() => {
        if(searchType) {
            setIsLoading(true);
            console.log('https://api.getsongbpm.com/search/?api_key='+apiKey+'&type='+searchType+'&lookup='+searchLookup);
            axios.get('https://api.getsongbpm.com/search/?api_key='+apiKey+'&type='+searchType+'&lookup='+searchLookup).then(res => {
                setIsLoading(false);
                console.log(res.data);
                if(searchType==='song') {
                    setData(res.data.search);
                }
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
            setSearchLookup('song:'+title+'artist:'+artist);
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
        setSongsList(data.map((songData) => 
            <li key={songData.id} className="song-title">
                <div>{songData.title}</div>
                <div>{songData.artist.name}</div>
            </li>
        ))
    },[data])

    return (
        <div className="Home">
            <div className="form">
                <form onSubmit={handleSearch}>
                    <label>
                        Artist:
                        <input type="text" name="artist" value={inputArtist} onChange={(e) => setInputArtist(e.target.value)}/>
                    </label>
                    <label>
                        Title:
                        <input type="text" name="title" value={inputTitle} onChange={(e) => setInputTitle(e.target.value)}/>
                    </label>
                    <input type="submit" value="Search" />
                </form>
            </div>
            <div className="loading">{isLoading ? 'Loading...' : 
                <div className="data">
                    <ul>{songsList}</ul>
                </div>}
            </div>
        </div>
    );
}
 
export default Home;