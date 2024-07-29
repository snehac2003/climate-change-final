document.addEventListener('DOMContentLoaded', function() {
    let currentScene = 1;
    const scenes = [scene1, scene2, scene3, scene4];

    function showScene(sceneIndex) {
        document.getElementById('slideshow').innerHTML = '';
        scenes[sceneIndex - 1]();
    }

    function createButton(text, onClick, position) {
        const button = document.createElement('button');
        button.innerText = text;
        button.style.position = 'absolute';
        button.style[position] = '10px';
        button.style.bottom = '10px';
        button.onclick = onClick;
        return button;
    }

    function sceneHeader(sceneNumber) {
        const header = document.createElement('header');
        header.className = 'scene-header';
        const h5 = document.createElement('h5');
        h5.innerText = `Scene ${sceneNumber}`;
        header.appendChild(h5);
        return header;
    }

    function scene1() {
        const section = document.createElement('section');
        section.className = 'scene';
        section.innerHTML = `
            <h2>Introduction</h2>
            <p>Overview of global temperature trends.</p>
            <div id="chart1"></div>
        `;
        document.getElementById('slideshow').appendChild(section);
        section.appendChild(sceneHeader(1));
        section.appendChild(createButton('Next →', () => { currentScene++; showScene(currentScene); }, 'right'));
        
        //d3.csv('https://raw.githubusercontent.com/snehac2003/climate-change-final/master/data/climate_change_dataset.csv'').then(data => {
        d3.csv('./data/climate_change_dataset.csv').then(data => {
            const parsedData = data.map(d => ({
                year: parseInt(d['Year'], 10),
                avgTempC: d['Avg_Temp (°C)'] ? parseFloat(d['Avg_Temp (°C)']) : null
            })).filter(d => !isNaN(d.year) && d.avgTempC !== null);

            const aggregatedData = Array.from(d3.group(parsedData, d => d.year), ([key, value]) => ({
                year: key,
                avgTempC: d3.mean(value, d => d.avgTempC)
            }));

            const margin = { top: 20, right: 30, bottom: 50, left: 70 };
            const width = 960 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            d3.select('#chart1').selectAll('*').remove();

            const svg = d3.select('#chart1')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(aggregatedData, d => new Date(d.year, 0, 1)))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(aggregatedData, d => d.avgTempC)])
                .range([height, 0]);

            const line = d3.line()
                .x(d => x(new Date(d.year, 0, 1)))
                .y(d => y(d.avgTempC));

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y')))
                .append('text')
                .attr('x', width / 2)
                .attr('y', 40)
                .attr('fill', 'black')
                .style('text-anchor', 'middle')
                .text('Year');

            svg.append('g')
                .call(d3.axisLeft(y))
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -height / 2)
                .attr('y', -50)
                .attr('fill', 'black')
                .style('text-anchor', 'middle')
                .text('Average Temperature (°C)');

            svg.append('path')
                .datum(aggregatedData)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr('d', line);

            const tooltip = d3.select('#chart1').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0)
                .style('position', 'absolute')
                .style('background', 'white')
                .style('border', '1px solid #ccc')
                .style('padding', '10px')
                .style('pointer-events', 'none');

            svg.selectAll('dot')
                .data(aggregatedData)
                .enter().append('circle')
                .attr('r', 5)
                .attr('cx', d => x(new Date(d.year, 0, 1)))
                .attr('cy', d => y(d.avgTempC))
                .attr('fill', 'steelblue')
                .on('mouseover', (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', .9);
                    tooltip.html(`Year: ${d.year}<br>Avg Temp: ${d.avgTempC.toFixed(2)}°C`)
                        .style('left', `${event.pageX + 5}px`)
                        .style('top', `${event.pageY - 28}px`);
                })
                .on('mouseout', () => {
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });
        }).catch(error => {
            console.error('Error loading the CSV file:', error);
        });
    }

    function scene2() {
        const section = document.createElement('section');
        section.className = 'scene';
        section.innerHTML = `
            <h2>Temperature Details by Year</h2>
            <p>Select the type of temperature to display:</p>
            <button id="avgTempC">Average Temp</button>
            <button id="minTempC">Minimum Temp</button>
            <button id="maxTempC">Maximum Temp</button>
            <div id="chart2"></div>
        `;
        document.getElementById('slideshow').appendChild(section);
        section.appendChild(sceneHeader(2));
        section.appendChild(createButton('← Back', () => { currentScene--; showScene(currentScene); }, 'left'));
        section.appendChild(createButton('Next →', () => { currentScene++; showScene(currentScene); }, 'right'));

        let tempType = 'avgTempC';

        function drawChart() {
            d3.csv('./data/climate_change_dataset.csv').then(data => {
                const parsedData = data.map(d => ({
                    year: parseInt(d['Year'], 10),
                    avgTempC: d['Avg_Temp (°C)'] ? parseFloat(d['Avg_Temp (°C)']) : null,
                    minTempC: d['Min_Temp (°C)'] ? parseFloat(d['Min_Temp (°C)']) : null,
                    maxTempC: d['Max_Temp (°C)'] ? parseFloat(d['Max_Temp (°C)']) : null
                })).filter(d => !isNaN(d.year));

                const aggregatedData = Array.from(d3.group(parsedData, d => d.year), ([key, value]) => ({
                    year: key,
                    avgTempC: d3.mean(value, v => v.avgTempC),
                    minTempC: d3.min(value, v => v.minTempC),
                    maxTempC: d3.max(value, v => v.maxTempC)
                }));

                const margin = { top: 20, right: 30, bottom: 50, left: 70 };
                const width = 960 - margin.left - margin.right;
                const height = 500 - margin.top - margin.bottom;

                d3.select('#chart2').selectAll('*').remove();

                const svg = d3.select('#chart2')
                    .append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);

                const x = d3.scaleTime()
                    .domain(d3.extent(aggregatedData, d => new Date(d.year, 0, 1)))
                    .range([0, width]);

                const y = d3.scaleLinear()
                    .domain([d3.min(aggregatedData, d => d[tempType]), d3.max(aggregatedData, d => d[tempType])])
                    .range([height, 0]);

                const line = d3.line()
                    .x(d => x(new Date(d.year, 0, 1)))
                    .y(d => y(d[tempType]));

                svg.append('g')
                    .attr('transform', `translate(0,${height})`)
                    .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y')))
                    .append('text')
                    .attr('x', width / 2)
                    .attr('y', 40)
                    .attr('fill', 'black')
                    .style('text-anchor', 'middle')
                    .text('Year');

                svg.append('g')
                    .call(d3.axisLeft(y))
                    .append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -height / 2)
                    .attr('y', -50)
                    .attr('fill', 'black')
                    .style('text-anchor', 'middle')
                    .text('Temperature (°C)');

                svg.append('path')
                    .datum(aggregatedData)
                    .attr('fill', 'none')
                    .attr('stroke', 'steelblue')
                    .attr('stroke-width', 1.5)
                    .attr('d', line);
            }).catch(error => {
                console.error('Error loading the CSV file:', error);
            });
        }

        document.getElementById('avgTempC').onclick = () => {
            tempType = 'avgTempC';
            drawChart();
        };
        document.getElementById('minTempC').onclick = () => {
            tempType = 'minTempC';
            drawChart();
        };
        document.getElementById('maxTempC').onclick = () => {
            tempType = 'maxTempC';
            drawChart();
        };

        drawChart();
    }

    function scene3() {
        const section = document.createElement('section');
        section.className = 'scene';
        section.innerHTML = `
            <h2>Yearly Precipitation Trends</h2>
            <p>Explore precipitation changes over the years.</p>
            <div id="chart3"></div>
        `;
        document.getElementById('slideshow').appendChild(section);
        section.appendChild(sceneHeader(3));
        section.appendChild(createButton('← Back', () => { currentScene--; showScene(currentScene); }, 'left'));
        section.appendChild(createButton('Next →', () => { currentScene++; showScene(currentScene); }, 'right'));

        d3.csv('./data/climate_change_dataset.csv').then(data => {
            const parsedData = data.map(d => ({
                year: parseInt(d['Year'], 10),
                precipitation: parseFloat(d['Precipitation (mm)'])
            })).filter(d => !isNaN(d.year) && !isNaN(d.precipitation) && d.precipitation < 10000);

            const aggregatedData = d3.rollup(parsedData,
                v => d3.sum(v, leaf => leaf.precipitation),
                d => d.year);

            const formattedData = Array.from(aggregatedData, ([year, total]) => ({
                year,
                total
            }));

            d3.select('#chart3').selectAll('*').remove();

            const margin = { top: 20, right: 30, bottom: 50, left: 70 };
            const width = 960 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            const svg = d3.select('#chart3').append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleBand()
                .range([0, width])
                .domain(formattedData.map(d => d.year))
                .padding(0.1);

            const y = d3.scaleLinear()
                .range([height, 0])
                .domain([0, d3.max(formattedData, d => d.total)]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.format('d')))
                .append('text')
                .attr('x', width / 2)
                .attr('y', 40)
                .attr('fill', 'black')
                .style('text-anchor', 'middle')
                .text('Year');

            svg.append('g')
                .call(d3.axisLeft(y))
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -height / 2)
                .attr('y', -50)
                .attr('fill', 'black')
                .style('text-anchor', 'middle')
                .text('Precipitation (mm)');

            const tooltip = d3.select('#chart3').append('div')
                .attr('class', 'tooltip');
            // const tooltip = d3.select('body').append('div')
            //     .attr('class', 'tooltip')
            //     .style('opacity', 0);

            svg.selectAll(".bar")
                .data(formattedData)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.year))
                .attr("y", d => y(d.total))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.total))
                .attr("fill", "steelblue")
                .on('mouseover', (event, d) => {
                    tooltip.style('opacity', 1)
                        .html(`Year: ${d.year}<br>Precipitation: ${d.total.toFixed(2)} mm`)
                        .style('left', `${event.pageX}px`)
                        .style('top', `${event.pageY - 28}px`);
                })
                .on('mouseout', () => {
                    tooltip.style('opacity', 0);
                });
        }).catch(error => {
            console.error('Error loading the CSV file:', error);
        });
    }

    function scene4() {
        const section = document.createElement('section');
        section.className = 'scene';
        section.innerHTML = `
            <h2>Climate Factors: Humidity and Wind Speed</h2>
            <p>Explore how humidity and wind speed levels have changed over the years.</p>
            <div id="chart4"></div>
        `;
        document.getElementById('slideshow').appendChild(section);
        section.appendChild(sceneHeader(4));
        section.appendChild(createButton('← Back', () => { currentScene--; showScene(currentScene); }, 'left'));

        d3.csv('./data/climate_change_dataset.csv').then(data => {
            const parsedData = data.map(d => ({
                year: parseInt(d['Year'], 10),
                humidity: parseFloat(d['Humidity (%)']),
                windSpeed: parseFloat(d['Wind_Speed (m/s)'])
            })).filter(d => !isNaN(d.year) && !isNaN(d.humidity) && !isNaN(d.windSpeed));

            const aggregatedData = d3.rollup(parsedData,
                v => ({
                    avgHumidity: d3.mean(v, d => d.humidity),
                    avgWindSpeed: d3.mean(v, d => d.windSpeed)
                }),
                d => d.year);

            const formattedData = Array.from(aggregatedData, ([year, values]) => ({
                year,
                ...values
            }));

            d3.select('#chart4').selectAll('*').remove();

            const margin = { top: 20, right: 80, bottom: 60, left: 80 };
            const width = 960 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            const svg = d3.select("#chart4")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            const g = svg.append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleBand()
                .range([0, width])
                .domain(formattedData.map(d => d.year))
                .padding(0.1);

            const yHumidity = d3.scaleLinear()
                .domain([0, 100])
                .range([height, 0]);

            const yWindSpeed = d3.scaleLinear()
                .domain([0, 50])
                .range([height, 0]);

            g.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));

            g.append("g")
                .call(d3.axisLeft(yHumidity));

            g.append("g")
                .attr("transform", `translate(${width}, 0)`)
                .call(d3.axisRight(yWindSpeed));

            const humidityBars = g.selectAll(".humidityBar")
                .data(formattedData)
                .enter().append("rect")
                .attr("class", "humidityBar")
                .attr("x", d => x(d.year))
                .attr("y", d => yHumidity(d.avgHumidity))
                .attr("width", x.bandwidth() / 2)
                .attr("height", d => height - yHumidity(d.avgHumidity))
                .attr("fill", "#69b3a2");

            const windSpeedBars = g.selectAll(".windSpeedBar")
                .data(formattedData)
                .enter().append("rect")
                .attr("class", "windSpeedBar")
                .attr("x", d => x(d.year) + x.bandwidth() / 2)
                .attr("y", d => yWindSpeed(d.avgWindSpeed))
                .attr("width", x.bandwidth() / 2)
                .attr("height", d => height - yWindSpeed(d.avgWindSpeed))
                .attr("fill", "#d88771");

            const zoom = d3.zoom()
                .scaleExtent([1, 5])
                .translateExtent([[0, 0], [width, height]])
                .on("zoom", (event) => {
                    g.attr("transform", event.transform);
                });

            svg.call(zoom);

            const legend = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "end")
                .selectAll("g")
                .data(["Humidity", "Wind Speed"])
                .enter().append("g")
                .attr("transform", (d, i) => `translate(-10,${i * 20})`)
                .style("cursor", "pointer")
                .on("click", function(event, d) {
                    const barClass = d === "Humidity" ? "humidityBar" : "windSpeedBar";
                    const isActive = svg.selectAll(`.${barClass}`).style("opacity") === "1";
                    svg.selectAll(`.${barClass}`).style("opacity", isActive ? 0 : 1);
                });

            legend.append("rect")
                .attr("x", width - 19)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", d => d === "Humidity" ? "#69b3a2" : "#d88771");

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9.5)
                .attr("dy", "0.32em")
                .text(d => d);

            svg.append("text")
                .attr("transform", `translate(${width / 2 + margin.left}, ${height + margin.top + 40})`)
                .style("text-anchor", "middle")
                .text("Year");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", margin.left / 2 - 20)
                .attr("x", -(height / 2) - margin.top)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Humidity (%)");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", width + margin.right - 20)
                .attr("x", -(height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Wind Speed (m/s)");
        }).catch(error => {
            console.error('Error loading the CSV file:', error);
        });
    }

    showScene(currentScene);
});
