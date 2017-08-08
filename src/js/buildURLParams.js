var buildStoryline = function() {
  //read url//
  var config = {}
  var data = {}
  var chart = {}
  var slider = {}
  var categories = ["data", "chart", "slider"]
  var mapURLParams = {
    dataURL: "url",
    dataYCol: "data_column_name",
    dataXCol: "datetime_column_name",
    dataDateFormat: "datetime_format",
    chartDateFormat: "datetime_format",
    chartYLabel: "y_axis_label",
    sliderStartCard: "start_at_card",
    sliderCardTitleCol: "title",
    sliderCardTextCol: "text",
  }

  var url = window.location.href
  var params = url.split('?')[1].split('&')
  params.map(function(param) {
    var d = {}
    var value = param.split('=')
    var configKey = categories.indexOf(value[0].split(/(?=[A-Z])/)[0])
    config[cat[configKey]][mapURLParams[value[0]]] = value[1]
  })

  //call storyline and append it to an iframe//
  var storyline = new Storyline('storyline', config)
}

window.onload = buildStoryline()
