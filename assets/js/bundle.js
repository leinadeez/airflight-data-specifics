(() => {
    const selector = selector => document.querySelector(selector)
    const create = element => document.createElement(element)

    const app = selector('#app')

    const flightSearch = create('div')
    flightSearch.classList.add('query')

    const Form = create('form')

        Form.onsubmit = async e => {    
            document.getElementById('btnSubmit').setAttribute('disabled','disabled')
            e.preventDefault()
            const flightNumber = Form.flightNumber.value 
            const flight = await getFlights(flightNumber)
            renderFlightInfo(flight, flightNumber)    
        }

    Form.oninput = e => {
        const [flightNumber, button] = e.target.parentElement.children;
        if(!flightNumber.value || flightNumber.value.length < 4 || flightNumber.value.length > 8) {
            button.setAttribute('disabled','disabled')
        } else {
            button.removeAttribute('disabled')
        }
    }

    Form.innerHTML = `
    <input type="text" required name="flightNumber" placeholder="Enter flight number" class="inputField" />
    <button type="submit" id="btnSubmit" class="btnSubmit" disabled="disabled">Enviar</button>
    `
    flightSearch.appendChild(Form)

    async function getFlights(flightNumber) {
        var flights
        try {
            await fetch(
                `https://aerodatabox.p.rapidapi.com/flights/${flightNumber}`, 
                {
                    method: 'GET',
                    headers: {
                        "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
                        "x-rapidapi-key": "e42ff4adadmsh861798578aacac0p196072jsna0f1bb9510c4",
                        "useQueryString": true
                    }
                })
            .then(response => {
                flights = response.json()
            })
        } catch (error) {
            console.log(error)
        }
        return flights
    }

    function renderFlightInfo(flight, flightNumber) {
        if(flight.length == 0) {
            alert(`Flight number ${flightNumber} not found.`)
            document.getElementById('btnSubmit').removeAttribute('disabled')
        } else {
            flightSearch.style.display = 'none'

            // General flight info

            const generalSection = create('section')

            const flightNumber = create('h1')
            flightNumber.innerHTML = `Flight ${flight[0].number}`
            generalSection.appendChild(flightNumber)
            
            const airline = create('p')
            airline.innerHTML = `<strong>Airline</strong>: ${flight[0].airline.name || "Unavailable"}`
            generalSection.appendChild(airline)

            const aircraft = create('p')
            aircraft.innerHTML = `<strong>Aircraft</strong>: ${flight[0].aircraft.model || "Unavailable"}`
            generalSection.appendChild(aircraft)

            const status = create('p')
            status.innerHTML = `<strong>Boarding Status</strong>: ${flight[0].status || "Unavailable"}`
            generalSection.appendChild(status)

            // Departures

            const departureSection = create('section')

            const depTitle = create('h2')
            depTitle.innerHTML = 'Departure info:'    
            departureSection.appendChild(depTitle)

            const depAirport = create('p')
            depAirport.innerHTML = `<strong>Airport</strong>: ${flight[0].departure.airport.name || "Name Unavailable"} (${flight[0].departure.airport.icao || 'ICAO Unavailable'}) `
            departureSection.appendChild(depAirport)

            const depDate = create('p')
            depDate.innerHTML = `<strong>Scheduled Date and time (UTC)</strong>: ${flight[0].departure.scheduledTimeUtc || 'Unavailable'}`
            departureSection.appendChild(depDate)

            const depActualDate = create('p')
            depActualDate.innerHTML = `<strong>Actual Date and time (UTC)</strong>: ${flight[0].departure.actualTimeUtc || 'Unavailable'}`
            departureSection.appendChild(depActualDate)

            const depCountDown = create('p')
            const countDownDate = Date.parse(flight[0].departure.actualTimeUtc || flight[0].departure.scheduledTimeUtc) - Date.parse(new Date())
            if (countDownDate < 0) {
                depCountDown.innerHTML = `This flight has already departed.`
            } else if (countDownDate >= 0) {
                const seconds = Math.floor((countDownDate/1000) % 60)
                const minutes = Math.floor((countDownDate/1000/60) % 60)
                const hours = Math.floor((countDownDate/(1000*60*60)) % 24)
                const days = Math.floor(countDownDate/(1000*60*60*24))
                depCountDown.innerHTML = `<strong>Time remaining until departure</strong>: ${days} days, ${hours}h, ${minutes}m and ${seconds}s.`
            } else {
                depCountDown.innerHTML = `<strong>Time remaining until departure</strong>: Unavailable`
            }
            departureSection.appendChild(depCountDown)        

            const depTerminal = create('p')
            depTerminal.innerHTML = `<strong>Terminal</strong>: ${flight[0].departure.terminal || 'Unavailable'}`
            departureSection.appendChild(depTerminal)

            const depDesk = create('p')
            depDesk.innerHTML = `<strong>Check In Desk</strong>: ${flight[0].departure.checkInDesk || 'Unavailable'}`
            departureSection.appendChild(depDesk)

            const depGate = create('p')
            depGate.innerHTML = `<strong>Gate</strong>: ${flight[0].departure.gate || 'Unavailable'}`
            departureSection.appendChild(depGate)

            // Arrivals

            const arrivalSection = create('section')

            const arrTitle = create('h2')
            arrTitle.innerHTML = 'Arrival info:'    
            arrivalSection.appendChild(arrTitle)

            const arrAirport = create('p')
            arrAirport.innerHTML = `<strong>Airport</strong>: ${flight[0].arrival.airport.name || "Name Unavailable"} (${flight[0].arrival.airport.icao || 'ICAO Unavailable'}) `
            arrivalSection.appendChild(arrAirport)

            const arrDate = create('p')
            arrDate.innerHTML = `<strong>Scheduled Date and time (UTC)</strong>: ${flight[0].arrival.scheduledTimeUtc || 'Unavailable'}`
            arrivalSection.appendChild(arrDate)

            const arrActualDate = create('p')
            arrActualDate.innerHTML = `<strong>Actual Date and time (UTC)</strong>: ${flight[0].arrival.actualTimeUtc || 'Unavailable'}`
            arrivalSection.appendChild(arrActualDate)

            const flightDetails = create('div')
            flightDetails.classList.add('flightDetails')

            // footer

            const footer = create('footer')

            const info = create('p')
            info.classList.add('tinyInfo')
            info.innerHTML = `This page will update itself every minute.`
            footer.appendChild(info)

            const refresher = create('a')
            refresher.innerHTML = 'Search for another flight'
            refresher.classList.add('refresher')
            refresher.setAttribute('href', '/')
            footer.appendChild(refresher)
            


            flightDetails.appendChild(generalSection)
            flightDetails.appendChild(departureSection)
            flightDetails.appendChild(arrivalSection)            
            flightDetails.appendChild(footer)

            app.appendChild(flightDetails)
            setTimeout(async function() {                
                const flights = await getFlights(flight[0].number)
                app.innerHTML = ''
                renderFlightInfo(flights, flight[0].number)
            }, 60000);
        }        
    }

    // init
    (async function(){
        app.appendChild(flightSearch)
    })()
})()