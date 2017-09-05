function displayResults(articles){
	$("#result").empty();

	articles.forEach(function(article){
		$("#result").append("<tr><td>" + article.headline + "</td>" +
                         "<td>" + article.subheaders + "</td>");
	})
};

// 1: On Load
// ==========

// First thing: ask the back end for json with all articles
$.getJSON("/all", function(data) {
  // Call our function to generate a table body
  displayResults(data);
});