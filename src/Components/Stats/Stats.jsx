import { useEffect, useState } from 'react';
import {Line, Doughnut} from 'react-chartjs-2';
import firebase from '../Firebase/firebase';
require('firebase/database');

const Stats = () => {
    const [lineahorno1, setlineahorno1] = useState([]);
    const [chartOptions, setchartOptions] = useState();
    const [temperatura, settemperatura] = useState(0);
    const [firebaseDatabase, setfirebaseDatabase] = useState();
    const [lecturas, setlecturas] = useState();
    const [dia, setdia] = useState();
    const [hora, sethora] = useState();
    const [anno, setanno] = useState();
    const [ultimasLecturas, setultimasLecturas] = useState();
    const [diaselect, setdiaselect] = useState(new Date());
    const [lecturapordia, setlecturapordia] = useState();
    const [labelpordia, setlabelpordia] = useState();
    

    function returnLecturasByDia(valor,newday = 0){
        let newdate = new Date(diaselect)
        if(newday > 0)
            newdate.setDate(newdate.getDate() + 1)
        else if(newday < 0)
            newdate.setDate(newdate.getDate() - 1)
        setdiaselect(new Date(newdate))
        const dia = newdate.getDate();
        const lecturas = ultimasLecturas.filter((lectura)=>{
            return lectura.dia == dia
        })
        if(lecturas.length == 0)
            return undefined
        if(valor === 'dia')
            return lecturas.map((data)=>{return data.dia})
        if(valor === 'valor')
            return lecturas.map((data)=>{return data.valor})
        return lecturas.map((data)=>{return data.hora})
    }

    function changeDayLectura(valor){
        if(valor > 0){
            setlecturapordia(returnLecturasByDia('valor',1))
            setlabelpordia(returnLecturasByDia('hora',1))
        }
        else{
            setlecturapordia(returnLecturasByDia('valor',-1))
            setlabelpordia(returnLecturasByDia('hora',-1))
        }
    }

    function updateDatabase(){
        if(lineahorno1.length == 0)
            firebaseDatabase.ref('Nodemcu/TThermok').limitToLast(10).once('value',(snapshot)=>{
                let tempArray = []
                snapshot.forEach((data) => {
                    tempArray.push(data.val())
                });
                settemperatura(tempArray[tempArray.length - 1])
                setlineahorno1(tempArray)    
            })
        firebaseDatabase.ref('Nodemcu/TThermok').limitToLast(1).on('child_added',(snapshot)=>{
            settemperatura(snapshot.val())
            setlineahorno1(arr =>[...arr.slice(1), snapshot.val()])
        })

        firebaseDatabase.ref('Nodemcu/Dia').limitToLast(10000).once('value',(snapshot)=>{
            let tempArray = []
            snapshot.forEach((child) => {
                tempArray.push(child.val())
            });
            setdia(tempArray)
        })

        firebaseDatabase.ref('Nodemcu/TThermok').limitToLast(10000).once('value',(snapshot)=>{
            let tempArray = []
            snapshot.forEach((child) => {
                tempArray.push(child.val())
            });
            setlecturas(tempArray)
        })

        firebaseDatabase.ref('Nodemcu/Hora').limitToLast(10000).once('value',(snapshot)=>{
            let tempArray = []
            snapshot.forEach((child) => {
                tempArray.push(child.val())
            });
            sethora(tempArray)
        })

    }

    useEffect(()=>{
        if(!firebaseDatabase){
            setfirebaseDatabase(firebase.database())
        }else if(!temperatura){
            settemperatura(0)
            updateDatabase()
        }
        if(lecturas && dia && hora && !ultimasLecturas){
            let tempUltimasLecturas = []
            for (let index = 0; index < lecturas.length; index++) {
                tempUltimasLecturas.push({valor:lecturas[index],dia:dia[index],hora:hora[index]})
            }
            setultimasLecturas(tempUltimasLecturas)
        }
        if(!lecturapordia && ultimasLecturas && !labelpordia){
            setlecturapordia(returnLecturasByDia('valor'))
            setlabelpordia(returnLecturasByDia('hora'))
        }
        if(!chartOptions)
            setchartOptions({
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                animation:{
                    duration:0,
                },
                maintainAspectRatio: false,
                tooltips: {
                    enabled: false,
                },
                elements: {
                    point: {
                        radius: 0
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder:false,
                        },
                        ticks:{
                            display:false,
                        },
                    },
                    y: {
                        min:150,
                        max:300,
                        grid: {
                            display: false,
                            drawBorder:false,
                        },
                        ticks:{
                            display:false,
                        },
                    },
                },
            })
    },[firebaseDatabase,chartOptions, hora, dia, lecturas, lecturapordia,ultimasLecturas, labelpordia])

    return ( 
        <>
        <div className="min-w-screen min-h-screen bg-gray-200 dark:bg-gray-700 flex w-full justify-center px-5 py-5">
            <div className="w-full max-w-3xl">
                <span className="mx-4 text-2xl dark:text-white">Temperaturas de los hornos</span>
                <div className="-mx-2 my-5 md:flex">
                    <div className="w-full md:w-1/3 px-2">
                        <div className="rounded-lg shadow-sm mb-4">
                            <div className="rounded-lg bg-white dark:bg-gray-800 shadow-lg md:shadow-xl relative overflow-hidden">
                                <div className="px-3 pt-8 pb-10 text-center relative z-10">
                                    <h4 className="text-sm uppercase text-gray-500 dark:text-white leading-tight">Horno Tiempo Real</h4>
                                    <h3 className="text-3xl text-gray-700 dark:text-white font-semibold leading-tight my-3">{temperatura} °C</h3>
                                    {
                                        lineahorno1.length>1 &&
                                        <p 
                                            className={(((temperatura - lineahorno1[lineahorno1.length - 2])/lineahorno1[lineahorno1.length - 2])*100).toFixed(2)>=0?
                                                `text-xs text-green-500 leading-tight`:
                                                `text-xs text-red-500 leading-tight`}>
                                                {(((temperatura - lineahorno1[lineahorno1.length - 2])/lineahorno1[lineahorno1.length - 2])*100).toFixed(2) >= 0?
                                                `▲`:
                                                `▼`} 
                                            {(((temperatura - lineahorno1[lineahorno1.length - 2])/lineahorno1[lineahorno1.length - 2])*100).toFixed(2)}%
                                        </p>
                                    }
                                </div>
                                <div className="absolute bottom-0 inset-x-0">
                                    {
                                        lineahorno1.length>0 &&
                                        <Line
                                    data={
                                        {
                                            labels: lineahorno1,
                                            datasets: [
                                                {
                                                    backgroundColor: "rgba(255, 180, 205, 0.1)",
                                                    borderColor: "rgba(255, 200, 205, 0.8)",
                                                    fill:true,
                                                    lineTension:0.5,
                                                    borderWidth: 2,
                                                    data: lineahorno1,
                                                },
                                            ],
                                        }
                                    }
                                    options={chartOptions}
                                    />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 px-2">
                        <div className="rounded-lg shadow-sm mb-4">
                            <div className="rounded-lg bg-white dark:bg-gray-800 shadow-lg md:shadow-xl relative overflow-hidden">
                                <div className="px-3 pt-8 pb-10 text-center relative z-10">
                                    <h4 className="text-sm uppercase text-gray-500 dark:text-white leading-tight">Lectura Máxima</h4>
                                    <h3 className="text-3xl text-gray-700 dark:text-white font-semibold leading-tight my-3">{lecturapordia?(Math.max(...lecturapordia)+`  °C`):`0 °C`}</h3>
                                    <p className="text-xs text-red-500 leading-tight">▼ 42.8%</p>
                                </div>
                                <div className="absolute bottom-0 inset-x-0">
                                    <canvas id="chart2" height="70"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 px-2">
                        <div className="rounded-lg shadow-sm mb-4">
                            <div className="rounded-lg bg-white dark:bg-gray-800 shadow-lg md:shadow-xl relative overflow-hidden">
                                <div className="px-3 pt-8 pb-10 text-center relative z-10">
                                    <h4 className="text-sm uppercase text-gray-500 dark:text-white leading-tight">Lectura Mínima</h4>
                                    <h3 className="text-3xl text-gray-700 dark:text-white font-semibold leading-tight my-3">{lecturapordia?(Math.min(...lecturapordia)+`  °C`):`0 °C`}</h3>
                                    <p className="text-xs text-green-500 leading-tight">▲ 8.2%</p>
                                </div>
                                <div className="absolute bottom-0 inset-x-0">
                                    <canvas id="chart3" height="70"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-3/3 px-2">
                        <div className="rounded-lg shadow-sm mb-4">
                            <div className="rounded-lg bg-white dark:bg-gray-800 shadow-lg md:shadow-xl relative overflow-hidden">
                                <div className="px-3 pt-8 pb-10 text-center relative z-10">
                                    <div className="inline-flex">
                                        <button 
                                            className="bg-gray-200 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-l"
                                            onClick={(e)=>changeDayLectura(-1)}
                                            >
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </button>
                                        <h4 className="mx-20 text-sm uppercase text-gray-500 dark:text-white leading-tight">{diaselect && diaselect.toDateString()}</h4>
                                        <button 
                                            className="bg-gray-200 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-r"
                                            onClick={(e)=>changeDayLectura(1)}
                                            >
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>                                        
                                        </button>
                                    </div>    
                                    <h3 className="mt-5 text-3xl text-gray-700 dark:text-white font-semibold leading-tight">{ lecturapordia?`Promedio`:`No hay datos para mostrar`} {lecturapordia && ((lecturapordia.reduce((p,c)=>p+c,0)/lecturapordia.length).toFixed(2)+`°C`)}</h3>
                                </div>
                                <div className="bottom-0 inset-x-0 px-5">
                                    {
                                        ultimasLecturas &&
                                        <Line data={
                                            {
                                                labels: labelpordia,
                                                datasets: [
                                                    {
                                                        backgroundColor: "rgba(255, 200, 205, 0.1)",
                                                        borderColor: "rgba(255, 200, 205, 0.8)",
                                                        fill:true,
                                                        lineTension:0.5,
                                                        borderWidth: 2,
                                                        data: lecturapordia,
                                                    },
                                                ],
                                            }
                                            } options={{
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },
                                                },
                                                animation:{
                                                    duration:0,
                                                },
                                                maintainAspectRatio: true,
                                                tooltips: {
                                                    enabled: false,
                                                },
                                                elements: {
                                                    point: {
                                                        radius: 0
                                                    },
                                                },
                                                scales: {
                                                    x: {
                                                        grid: {
                                                            display: true,
                                                            drawBorder:true,
                                                        },
                                                        ticks:{
                                                            display:true,
                                                        },
                                                        title: {
                                                            display: true,
                                                            text: 'Hora'
                                                        }
                                                    },
                                                    y: {
                                                        min:150,
                                                        max:300,
                                                        grid: {
                                                            display: true,
                                                            drawBorder:true,
                                                        },
                                                        ticks:{
                                                            display:true,
                                                            callback:function(value, index, values){
                                                                return value+' °C';
                                                            }
                                                        },
                                                        title: {
                                                            display: true,
                                                            text: 'Temperatura'
                                                        }
                                                    },
                                                },
                                            }} />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
        </>
     );
}
 
export default Stats;