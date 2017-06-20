const tvApp = {};

tvApp.init = function() {
	tvApp.events();
};

tvApp.apiKey = 'c53703c98c891a9440f4334af8a7c43a';
tvApp.baseApiURL = 'https://api.themoviedb.org/3'
tvApp.userInput = "";

tvApp.saintIcon = ["./assets/mother-theresa.png", "./assets/st-augustine.png", "./assets/st-therese.png", "../assets/stbenedictblack.png", "./assets/stVeronicaGiuliani.png"];

//user submits name of television show to search input
tvApp.events = function(){
	$("#tvShowSubmit").on("click", function(e){
		e.preventDefault();
		tvApp.userInput = $("#tvShowChoice").val();
		tvApp.getTelevisionId();
	});

	$(".tv").on("click", "a", function(){
		console.log(this);
		location.reload();
	});
};

// correlates the name of TV show with Movie DB API id number
tvApp.getTelevisionId = function() {
	$.ajax({
		url: tvApp.baseApiURL + "/search/tv",
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: tvApp.apiKey,
			query: tvApp.userInput
		}
	})
	.then(function(tvData) {
		const tvId = tvData.results[0].id;
		if (tvId === undefined){
			alert("SORRY! That's not a real TV show!")
		} else {
			tvApp.getTelevisionShow(tvId);
		}
		// console.log(tvData);

	});
};
//uses ID number of show to find detailed info about show including last season and last episode
tvApp.getTelevisionShow = function(tvId) {
	$.ajax({
		url: tvApp.baseApiURL + "/tv/" + tvId,
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: tvApp.apiKey
		}
	})
	.then(function(seasonData){
		const tvSeason = seasonData.seasons[seasonData.seasons.length - 1];
		const lastSeason = tvSeason.season_number;
		const lastEpisode = tvSeason.episode_count;
		tvApp.getFinalEpisodeDate(tvId, lastSeason, lastEpisode);
		// console.log(tvSeason);
	});
};

//finds the date of final episode
tvApp.getFinalEpisodeDate = function(tvId, lastSeason, lastEpisode) {
	$.ajax({
		url: `${tvApp.baseApiURL}/tv/${tvId}/season/${lastSeason}/episode/${lastEpisode}`,
		method: 'GET',
		dataType: 'json',
		data: {
			api_key: tvApp.apiKey
		}
	})
	.then(function(finalSeason){
		tvApp.airDate = finalSeason.air_date.replace(/-/g, "/");
		tvApp.getLiturgicalDate(tvApp.airDate);
		// console.log(tvApp.airDate);
		
	});
};

// corresponds date of final date of TV show with date in Catholic Liturgical Calendar
tvApp.getLiturgicalDate = function(airDate) {
	$.ajax({
		url: `http://calapi.inadiutorium.cz/api/v0/en/calendars/default/${tvApp.airDate}`,
		method: 'GET',
		dataType: 'json'
	})
	.then(function(saintSearch){
			tvApp.collateInfo(saintSearch);
			
	});
};

// gets data from Catholic Liturgical Calendar and prints it on the page
tvApp.collateInfo = function(saintSearch){

	//return season and weekday
	tvApp.weekdayInfo = saintSearch.weekday;

	tvApp.seasonInfo = saintSearch.season;             

	// return name of saint(s) and colour for day
	tvApp.saintInfo = saintSearch.celebrations;

	tvApp.origAirDateFormat = tvApp.airDate.replace(/[/]/g, "-");
	tvApp.formattedAirDate = moment(tvApp.origAirDateFormat).format("MMMM Do YYYY");

	tvApp.saintInfo.forEach(function(saint){
		tvApp.saintTitle = saint.title;
		tvApp.saintColor = saint.colour;
	});

		//responses are generated based on user's input

		//add if statement re: Vatican II if show ended before 1969

		if (tvApp.seasonInfo === "ordinary")  { 
		collated = `<p>The final episode of ${tvApp.userInput} aired on ${tvApp.formattedAirDate}. It was an ordinary <span class="capitalize">${tvApp.weekdayInfo}</span>.</p><a href="#home">Try again!</a>`;
		} else if  (tvApp.saintTitle === "" || tvApp.saintColours === "") {
		collated = `<p>The final episode of ${tvApp.userInput} aired on ${tvApp.formattedAirDate}. It was a <span class="capitalize">${tvApp.weekdayInfo}</span>, during the season of <span class="capitalize">${tvApp.seasonInfo}</span>.</p><a href="#home">Try again!</a>`;
		} else if (tvApp.saintTitle !== "" || tvApp.saintColours !== "")  { 
		collated = `<p>The final episode of ${tvApp.userInput} aired on ${tvApp.formattedAirDate}. It was a <span class="capitalize">${tvApp.weekdayInfo}</span>, celebrating ${tvApp.saintTitle}, during the season of <span class="capitalize">${tvApp.seasonInfo}</span>.</p><a href="#home">Try again!</a>`;
	  }
	
	  $(".fave-show").html(collated);
	  $(".tv").addClass("tv-response");
	  tvApp.changeResponseBG();
};

tvApp.changeResponseBG = function(){
	let randomIcon = Math.floor(Math.random() * tvApp.saintIcon.length);
	$(".tv-response").css("background-image", `url(${tvApp.saintIcon[randomIcon]})`)
};

$(function () {
	tvApp.init();
});

