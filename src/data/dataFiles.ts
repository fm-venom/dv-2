// Система для работы с файлами данных
export interface DataFile {
  users: any[];
  builds: any[];
  raids: any[];
  pendingBuilds: any[];
  userLikes: { [userId: string]: string[] };
  buildViews: { [buildId: string]: number };
  currentUser: any | null;
}

// Функция для загрузки данных из файла
export const loadDataFromFile = async (filename: string): Promise<any> => {
  try {
    const response = await fetch(`/data/${filename}`);
    if (response.ok) {
      const text = await response.text();
      // Извлекаем данные из JS файла (убираем export default и парсим JSON)
      const jsonString = text.replace(/^export default\s+/, '').replace(/;$/, '');
      return JSON.parse(jsonString);
    }
  } catch (error) {
    console.log(`Файл ${filename} не найден, создаем новый`);
  }
  return null;
};

// Функция для сохранения данных в файл
export const saveDataToFile = async (filename: string, data: any): Promise<void> => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const fileContent = `export default ${jsonString};`;
    
    // В реальном приложении здесь был бы API вызов для сохранения файла
    // Для демонстрации используем localStorage как fallback
    localStorage.setItem(`file_${filename}`, fileContent);
    
    console.log(`Данные сохранены в файл ${filename}`);
  } catch (error) {
    console.error(`Ошибка сохранения в файл ${filename}:`, error);
  }
};

// Функция для загрузки данных с fallback на localStorage
export const loadDataWithFallback = async (filename: string, localStorageKey: string, defaultValue: any): Promise<any> => {
  // Сначала пытаемся загрузить из файла
  let data = await loadDataFromFile(filename);
  
  if (data === null) {
    // Если файла нет, пытаемся загрузить из localStorage
    const localData = localStorage.getItem(`file_${filename}`);
    if (localData) {
      try {
        const jsonString = localData.replace(/^export default\s+/, '').replace(/;$/, '');
        data = JSON.parse(jsonString);
      } catch (error) {
        console.error('Ошибка парсинга данных из localStorage:', error);
      }
    }
    
    // Если и в localStorage нет, используем старые данные из localStorage
    if (data === null) {
      const oldData = localStorage.getItem(localStorageKey);
      if (oldData) {
        data = JSON.parse(oldData);
        // Сохраняем в новом формате
        await saveDataToFile(filename, data);
      } else {
        data = defaultValue;
      }
    }
  }
  
  return data;
};