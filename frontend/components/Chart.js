import React from 'react';
import * as V from 'victory';


function Chart({ data }) {

    let tickCount = 4;
    let minImpliedVol = Math.min(...data.filter(d => d.exchange === 'SOL').map(item => item.implied_volatility));
    let maxImpliedVol = Math.max(...data.filter(d => d.exchange === 'SOL').map(item => item.implied_volatility));


    return (
        <>
            <V.VictoryChart
                theme={V.VictoryTheme.material}
                domain={{ y: [0, maxImpliedVol + 0.5] }}
                height={400}
                width={700}
                containerComponent={
                    <V.VictoryVoronoiContainer />
                }
            >
                <V.VictoryLegend
                    orientation="horizontal"
                    colorScale={["blue"]}
                    gutter={20}
                    style={{ border: { stroke: "black" }, labels: { fill: 'white' } }}
                    data={[
                        { name: "SOL" }]}
                />

                <V.VictoryAxis
                    label={"Datetime"}
                    margin={{ top: 100, bottom: 600 }}
                    tickCount={tickCount}
                    tickFormat={(x) => new Date(x).toLocaleString('en-US')}
                    axisLabelComponent={<V.VictoryLabel dy={25} />}
                />
                <V.VictoryAxis
                    dependentAxis
                    label={"Implied volatility"}
                    axisLabelComponent={<V.VictoryLabel dy={-25} />}
                />

                {/* SOL */}
                <V.VictoryScatter
                    labelComponent={<V.VictoryTooltip />}
                    style={{ data: { fill: "blue" } }}
                    samples={15}
                    size={5}
                    y={"implied_volatility"}
                    x={d => d.current_datetime}
                    data={data.filter((d) => d.exchange === 'SOL')}
                    labels={({ datum }) => `SOL IV: ${datum.implied_volatility.toFixed(2)} @ ${datum.current_datetime}`}
                />

                <V.VictoryLine
                    labelComponent={<V.VictoryTooltip />}
                    style={{
                        data: { stroke: "blue", strokeWidth: 2 },
                        parent: { border: "0.5px solid #ccc" }
                    }}
                    y={"implied_volatility"}
                    x={d => d.current_datetime}
                    data={data.filter((d) => d.exchange === 'SOL')}
                />


                {/* BTC
                <V.VictoryScatter
                    style={{ data: { fill: "green" } }}
                    labelComponent={<V.VictoryTooltip />}
                    size={5}
                    y={"implied_volatility"}
                    x={d => d.current_datetime}
                    data={data.filter((d) => d.exchange === 'BTC')}
                    labels={({ datum }) => `BTC IV: ${datum.implied_volatility.toFixed(2)} @ ${datum.current_datetime}`}
                />
                <V.VictoryLine
                    style={{
                        data: { stroke: "green", strokeWidth: 2 },
                        parent: { border: "1px solid #ccc" }
                    }}
                    y={"implied_volatility"}
                    x={"current_datetime"}
                    data={data.filter((d) => d.exchange === 'BTC')}
                />
                 */}

            </V.VictoryChart>
        </>
    )
}
export default Chart;
