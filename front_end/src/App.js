import React from 'react';
import logo from './logo.svg';
import './App.css';
import ReactDOM from 'react-dom'
import Spotify from 'spotify-web-api-js'
import openSocket from 'socket.io-client';

const PORT = process.env.PORT || 3231;
//opening a web socket connection
const socket = openSocket(window.location.hostname);

//creating a new Spotify Player object from the API
const syncify = new Spotify();

//function used to parse the access token from the url provided
function getWindowData(){
    var url = window.location.href;
    var beginning_loc = url.search('=')
    var end_loc = url.search('&')
    var access_token = url.slice(beginning_loc+1, end_loc);
    return access_token
}

//inputting the access token so that we can modify the state
syncify.setAccessToken(getWindowData())

//pausing the playback so that all users can be synchronized (may fix later)
syncify.pause({})
socket.on('command', (command) => {

    //checking the specific command of the user
    if(command == "pause"){
        console.log('paused');
        syncify.pause({});
    }else if(command == "play"){
        console.log('playing');
        syncify.play({})
    }
});

class App extends React.Component{
    constructor(props){
        super(props);

        //delcaring the states of the app so that we can keep track of key information about the playback
        this.state = {
            //logged: params.access_token ? true : false,
            name: 'Not checked',
            image: '',
            timestamp: 0,
            MS: "00:00",
            URI: ""
        }

        //binding the functions to this statement
        this.getNowPlaying = this.getNowPlaying.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.sync = this.sync.bind(this);

        socket.on('sync', (command) => {
            var URI = ""
            syncify.getTrack(command.ID).then((response) => {
                syncify.play({
                    //"context_uri": URI,
                    "uris": [response.uri],
                })
                syncify.seek(command.timestamp, {})
                this.getNowPlaying()
            })
        })
        //getting the song being played
        this.getNowPlaying();
    }



    //A function to get information about the song currently being played
    getNowPlaying() {
        syncify.getMyCurrentPlaybackState()
          .then((response) => {
                this.setState({
                        name: response.item.name,
                        image: response.item.album.images[0].url,
                        timestamp: response.progress_ms,
                        MS: this.MstoMin(response.progress_ms),
                        ID: response.item.id
                })
            })
    }

    //play the music
    play(){

        //sending a signal to play
        socket.emit('play', 'play');
        syncify.play({});
    }

    //Converting milisecond to minutes:seconds
    MstoMin(time) {
        var extra = ""
        var seconds = time/1000;

        //getting the number of minutes and seconds
        var minutes = (seconds - seconds%60)/60;
        var remainder = Math.round(seconds - minutes*60);

        //checking if an extra 0 is being added
        if (remainder < 10){
            var extra = "0"
        }
        return minutes.toString() + ":" + extra +remainder.toString();

    }

    //a function to pause the playback, and to send signal to socket
    pause(){

        //sending a signal to socket.io to pause the playback
        socket.emit('pause', 'pause');
        syncify.pause({});
    }

    sync(){
        this.getNowPlaying();
        socket.emit('sync', this.state)
    }

    componentDidMount(){
        this.interval = setInterval(() => this.getNowPlaying(), 1000);
    }

    componentWillUnmount(){
        clearInterval(this.interval)
    }

    //rendering the page
    render(){
        return <div className="App">
            <a href="https://syncify-auth.herokuapp.com/">
                <button>Log in with spotify</button>
            </a>
            <div> Now Playing: {this.state.name}</div>
            <div>
                <img src={this.state.image} />
            </div>
            <button onClick={this.sync}>Sync with me</button>
            <button onClick={this.pause}>Pause</button>
            <button onClick={this.play}>Play</button>
            <h1>{this.state.MS}</h1>
            <p>Timestamp: {this.state.timestamp}</p>
        </div>
    }
}

class SearchSongs extends React.Component{
    constructor(props){
        
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
export default App;