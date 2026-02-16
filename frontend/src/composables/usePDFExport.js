import { jsPDF } from 'jspdf';

export function usePDFExport() {
  
  const generatePDF = async (locations, mode) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    let yPos = 20;

    // Заголовок
    doc.setFontSize(22);
    doc.setTextColor(251, 191, 36);
    doc.text('SkyGlow PRO', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Отчет о качестве ночного неба', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPos);
    doc.text(`Режим: ${mode === 'compare' ? 'Сравнение' : 'Одиночный анализ'}`, 20, yPos + 5);

    yPos += 20;

    // Данные по локациям
    locations.forEach((loc, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      if (index > 0) {
        yPos += 10;
        doc.setDrawColor(51, 65, 85);
        doc.setLineWidth(0.5);
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 15;
      }

      if (mode === 'compare') {
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(`Локация ${index + 1}`, 20, yPos);
        yPos += 8;
      }

      // Название
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(loc.name || 'Неизвестная локация', 20, yPos);
      yPos += 7;

      // Координаты
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      const lat = loc.lat || loc.center?.[0] || 0;
      const lon = loc.lon || loc.center?.[1] || 0;
      doc.text(`Координаты: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, 20, yPos);
      yPos += 10;

      // Таблица
      const tableData = [
        ['Параметр', 'Значение'],
        ['Класс Бортля', String(loc.bortle)],
        ['SQM', `${loc.sqm} маг/аркс²`],
        ['Тип данных', getSourceTypeText(loc.sourceType)],
        ['Удаленность', loc.distance ? `${loc.distance} км` : '—']
      ];

      const cellHeight = 8;
      const colWidths = [80, 90];
      
      tableData.forEach((row, rowIndex) => {
        let xPos = 20;
        row.forEach((cell, colIndex) => {
          if (rowIndex === 0) {
            doc.setFillColor(30, 41, 59);
            doc.rect(xPos, yPos - 6, colWidths[colIndex], cellHeight, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
          } else {
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
          }
          doc.text(String(cell), xPos + 3, yPos);
          xPos += colWidths[colIndex];
        });
        yPos += cellHeight;
      });

      yPos += 10;

      // Описание
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Условия наблюдения:', 20, yPos);
      yPos += 5;
      
      doc.setTextColor(0, 0, 0);
      const desc = getBortleDescription(loc.bortle);
      const splitDesc = doc.splitTextToSize(desc, pageWidth - 40);
      doc.text(splitDesc, 20, yPos);
      yPos += splitDesc.length * 5 + 5;

      // Видимость
      doc.setTextColor(100, 116, 139);
      doc.text('Видимость объектов:', 20, yPos);
      yPos += 5;

      const visibility = [
        { name: 'Млечный Путь', visible: loc.bortle <= 4 },
        { name: 'Зодиакальный свет', visible: loc.bortle <= 3 },
        { name: 'Галактики Мессье', visible: loc.bortle <= 2 }
      ];

      visibility.forEach(item => {
        doc.setTextColor(item.visible ? 34 : 100, item.visible ? 197 : 116, item.visible ? 94 : 139);
        doc.text(`${item.visible ? '+' : '-'} ${item.name}`, 25, yPos);
        yPos += 5;
      });

      yPos += 10;
    });

    // Сравнение
    if (mode === 'compare' && locations.length === 2) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(251, 191, 36);
      doc.text('Сравнение', 20, yPos);
      yPos += 10;

      const loc1 = locations[0];
      const loc2 = locations[1];
      const sqmDiff = parseFloat(loc2.sqm) - parseFloat(loc1.sqm);

      const comparisonData = [
        ['Параметр', loc1.name.substring(0, 20), loc2.name.substring(0, 20)],
        ['SQM', loc1.sqm, loc2.sqm],
        ['Бортль', String(loc1.bortle), String(loc2.bortle)]
      ];

      const cellHeight = 8;
      const colWidths = [60, 55, 55];
      
      comparisonData.forEach((row, rowIndex) => {
        let xPos = 20;
        row.forEach((cell, colIndex) => {
          if (rowIndex === 0) {
            doc.setFillColor(30, 41, 59);
            doc.rect(xPos, yPos - 6, colWidths[colIndex], cellHeight, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
          } else {
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
          }
          doc.text(String(cell), xPos + 3, yPos);
          xPos += colWidths[colIndex];
        });
        yPos += cellHeight;
      });

      yPos += 10;
      
      const winner = sqmDiff > 0 ? loc2.name : loc1.name;
      doc.setFontSize(11);
      doc.setTextColor(251, 191, 36);
      doc.text(`Рекомендуется: ${winner.substring(0, 30)}`, 20, yPos);
    }

    // Футер
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`SkyGlow PRO | Стр. ${i} из ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`skyglow-report-${Date.now()}.pdf`);
    return true;
  };

  const getSourceTypeText = (type) => {
    const types = {
      city: 'Точные данные',
      suburb: 'Интерполяция',
      rural: 'Оценка (село)',
      remote: 'Оценка (удаленная)'
    };
    return types[type] || 'Неизвестно';
  };

  const getBortleDescription = (bortle) => {
    const descriptions = {
      1: 'Отличное темное небо. Зодиакальный свет виден.',
      2: 'Типичное темное небо. Млечный Путь с деталями.',
      3: 'Сельская местность. Млечный Путь виден.',
      4: 'Пригород/село. Млечный Путь слабый.',
      5: 'Пригород. Млечный Путь едва виден.',
      6: 'Яркий пригород. Млечный Путь в зените.',
      7: 'Город/пригород. Млечный Путь невиден.',
      8: 'Город. Только яркие звезды.',
      9: 'Центр города. Почти ничего не видно.'
    };
    return descriptions[bortle] || 'Нет данных';
  };

  return { generatePDF };
}