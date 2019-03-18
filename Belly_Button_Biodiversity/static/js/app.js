
//when new smple is select
d3.select("select").on('change', function() {
  var Sample = d3.select("#selDataset").property('value');
  optionChanged(Sample);
});


function buildMetadata(sample) {

  var url = "/metadata/" + sample;
  //creating js object
  var meta_sample = d3.select("#sample-metadata");
  //send get request to obtain data for that particular sample
  d3.json(url).then(function(result) {
    meta_sample.html("");
    //append metadata to sample-metadata div
    Object.entries(result).forEach(([key, value]) => meta_sample.append("div").text(`${key}: ${value}`));
  });
}


function buildCharts(sample) {
  var url = "/samples/" + sample;
  d3.json(url).then(function(response) {
    console.log(response);
    var filtered_values = [];
    var filtered_otu_ids = [];
    var filtered_otu_labels = [];
    var len = response.sample_values.length;
    var indices = new Array(len);
    for (var i = 0; i < len; i++) {
      indices[i] = i;
      indices.sort(function (a, b) { return response.sample_values[a] < response.sample_values[b] ? 1 : response.sample_values[a] > response.sample_values[b] ? -1 : 0; });
    }    
    for (var i =0; i<10; i++){
      var j = indices[i];
      filtered_values.push(response.sample_values[j]);
      filtered_otu_ids.push(response.otu_ids[j]);
      filtered_otu_labels.push(response.otu_labels[j]);
    }
  
    var layout1 = {
      annotations: [
        {
          font: {
            size: 15
          },
          showarrow: false,
          text: "Top 10 Samples",
          x: 0.3,
          y: 0.5
        }
      ],
      height: 500,
      width: 500
    };
    var trace1 = [{
      type: "pie",
      values: filtered_values,
      labels: filtered_otu_ids.map(String),
      text: filtered_otu_labels,
      hole: .4,
      textinfo: 'percent'
    }];
    console.log(trace1);
    var PIE = document.getElementById('pie');
    Plotly.newPlot(PIE, trace1, layout1);

    var trace2 = [{
      x: response.otu_ids,
      y: response.sample_values,
      text: response.otu_labels,
      mode: 'markers',
      marker: {
        color:response.otu_ids,
        size: response.sample_values
      }
    }];
    var layout2 = {
      title: 'Bubble chart for each sample',
      showlegend: false,
      height: 600,
      width: 1400
    };
    console.log(trace2);
    Plotly.newPlot('bubble', trace2, layout2);
  });
}


function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");
  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    //buildGauge(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
