(function() {
  $(document).ready(function() {
    $('form').attr('action', 'javascript:void(0);');
    return $('form').submit(function() {
      var query;
      $('#results').append('<h2>Results stream</h2><div id="tweets"></div>');
      query = $('#q').val();
      $.stream("/q/" + query, {
        type: "http",
        reconnect: false,
        handleMessage: function(text, message) {
          var end;
          end = text.indexOf("\r\n", message.index);
          if (end < 0) {
            return false;
          }
          message.data = text.substring(message.index, end);
          return message.index = end + "\r\n".length;
        }
      });
      return $(document).streamMessage(function(e, event) {
        var tweet;
        tweet = $.parseJSON(event.data);
        return $("<p />").prependTo("#tweets").addClass(tweet.mood + " tweet").html('<a class="name" href="http://twitter.com/' + tweet.user + '">' + tweet.user + '<' + '/a>: ' + tweet.text + ' (probability:' + tweet.probability + ')');
      });
    });
  });
}).call(this);
