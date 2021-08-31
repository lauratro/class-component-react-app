let accessToken;
const clientId = process.env.REACT_APP_CLIENT_ID;
const redirectUri = "http://localhost:3000/";

export let Spotify ={
    getAccessToken(){
        if(accessToken){
            return accessToken;
        }
        else{
           
            let accessTokenMatch =  window.location.href.match(/access_token=([^&]*)/);
            let expireInMatch =  window.location.href.match(/expires_in=([^&]*)/)
        
            if(accessTokenMatch && expireInMatch){
                accessToken = accessTokenMatch[1];
                const expiresIn = Number(expireInMatch[1]);
                window.setTimeout(() => accessToken = '', expiresIn * 1000);
                window.history.pushState('Access Token', null, '/');
                    return accessToken;
                   
                    
            }else{
                let accessTokenUrl = ` https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`
                window.location = accessTokenUrl
            }
        }
    },
    search(term){
    let accessToken = Spotify.getAccessToken();

       return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,{
            headers: {Authorization : `Bearer ${accessToken}`}
          }).then(response => response.json()
          ).then(jsonResponse =>  {
              if (!jsonResponse.tracks) {
                  return [];
              }
                return jsonResponse.tracks.items.map( track => ({
                  id : track.id,
                    name : track.name,
                   artist : track.artists[0].name,
                   album : track.album.name,
                   uri :track.uri
                }));


                });
             },
             savePlaylist(name , trackUris){
                 if(!name || !trackUris.length){
                     return;
                 }
                     let accessToken = Spotify.getAccessToken();
                     let headers = {Authorization : `Bearer ${accessToken}`};
                     let userId;
                     return fetch(`https://api.spotify.com/v1/me`, {headers : headers}
                     ).then(response => response.json()
                     ).then(jsonResponse => {
                          userId = jsonResponse.id;
                     
                    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {headers: headers,
                    method : 'POST',
                body : JSON.stringify({name : name}) 
            }).then( response => response.json()
            ).then(jsonResponse =>{
                let playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers : headers,
                    method : 'POST',
                    body : JSON.stringify({uris : trackUris})
                }).then(response => {
                    response.json();
                })
            })
             })
}
}
        
    
