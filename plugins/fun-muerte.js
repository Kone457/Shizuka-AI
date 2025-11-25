

let handler = async (m) => {
    try {
        let minYear = 2026;
        let maxYear = 2090;
        let randomYear = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
        let randomMonth = Math.floor(Math.random() * 12) + 1;
        let randomDay = Math.floor(Math.random() * 28) + 1; 

        let deathReasons = [
            "Reírse demasiado fuerte hasta morir.",
            "Ahogarse en una pequeña piscina de lágrimas.",
            "Caerse de la cama mientras intentaba dormir.",
            "Tropezar con los cordones de los zapatos y caer cómicamente.",
            "Explotar de risa después de entender un chiste tonto.",
            "Explotar de enojo mientras jugaba un videojuego.",
            "Comer una gran cantidad de dulces y azúcares y chocar contra la pared.",
            "Hablar con loros durante horas sin parar.",
            "Desmayarse de admiración por sí mismo mientras se miraba en el espejo.",
            "Caerse desde lo alto de una silla intentando mantener el equilibrio.",
            "Electrocutarse intentando actualizar Facebook.",
            "Dudar de la existencia de la gravedad y saltar desde una ventana del piso bajo.",
            "Moverse torpemente en el aire mientras intentaba aprender a bailar.",
            "Desmayarse por el ruido alto durante una boda.",
            "Golpearse en la cabeza con una cesta de ropa pesada.",
            "Respirar en forma circular mientras intentaba pensar en una ecuación matemática.",
            "Someterse a expresiones faciales muy profundas y dejar de respirar.",
            "Convertirse en planta y comerse a sí mismo.",
            "Ahogarse de risa mientras intentaba dar un discurso importante.",
            "Caerse del avión debido a una rápida turbulencia.",
            "Comer pizza caliente rápidamente y sufrir graves quemaduras en la boca.",
            "Ganar el premio Nobel de física y explotar de orgullo.",
            "Enamorarse de un libro y que su historia fuera demasiado dolorosa.",
            "Caerse de la cama y quedar atrapado en una trampa de almohadas.",
            "Enredarse en los hilos de la cortina y caer terriblemente.",
            "Comer una gran cantidad de chocolate y sufrir una alergia severa.",
            "Ahogarse en una piscina de peces y fusionarse con el ambiente.",
            "Comer un pastel sorpresa y sufrir un shock de felicidad.",
            "Caerse de las escaleras mientras jugaba videojuegos.",
            "Comer palomitas en exceso y explotar de saciedad.",
            "Interactuar con la nieve y congelarse hasta convertirse en estatua de nieve.",
            "Convertirse en héroe de fantasía y chocar con la realidad.",
            "Desmayarse de admiración por una escena de película muy conmovedora.",
            "Suicidarse por amor y quedar atrapado en el mundo de los sueños.",
            "Comer frijoles repetidamente y sufrir una explosión gaseosa.",
            "Caerse de la bicicleta mientras se divertía.",
            "Sumergirse en una piscina de café y hundirse en un sueño profundo.",
            "Enamorarse de los gatos y superar todos los obstáculos.",
            "Chocar contra el suelo después de perder el equilibrio en el espacio.",
            "Caer del cielo después de intentar volar con alas de papel.",
            "Comer mucha fruta y sufrir una explosión de piña.",
            "Desmayarse de admiración por sí mismo después de que su familia confirmara su genialidad.",
        ];

        let randomIndex = Math.floor(Math.random() * deathReasons.length);
        let randomDeathReason = deathReasons[randomIndex];

        m.reply(`*⎔ ⋅ ───━ •﹝👑﹞• ━─── ⋅ ⎔*\n\n👑⤺┇ *Fecha de muerte:* *${randomDay}-${randomMonth}-${randomYear}*\n\n*Causa:* \n*${randomDeathReason}*\n\n*⎔ ⋅ ───━ •﹝👑﹞• ━─── ⋅ ⎔*`);
    } catch (error) {
        console.error('Error generando fecha de muerte aleatoria:', error);
        m.reply('Ocurrió un error al generar la fecha de muerte aleatoria. Por favor, intenta de nuevo.');
    }
}

handler.command = /^(muerte)$/i;

export default handler;