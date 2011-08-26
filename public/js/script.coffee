$(document).ready(() ->
	$('form').attr('action', 'javascript:void(0);')
	$('form').submit(() ->
		$('#results').append('<h2>Results stream</h2><div id="tweets"></div>')
		query = $('#q').val()
		$.stream("/q/"+query, {
			type: "http",
			reconnect: false,
			handleMessage: (text, message) ->
				end = text.indexOf("\r\n", message.index);
				if (end < 0)
					return false;
				message.data = text.substring(message.index, end);
				message.index = end + "\r\n".length;
		})
		$(document).streamMessage((e, event) ->
			tweet = $.parseJSON(event.data)
			$("<p />").prependTo("#tweets").addClass(tweet.mood+" tweet").html('<a class="name" href="http://twitter.com/'+tweet.user+'">'+tweet.user+'<'+'/a>: '+tweet.text+' (probability:'+tweet.probability+')')
		)
	)
)