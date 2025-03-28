import mysql.connector
import os
from dotenv import load_dotenv
import time


def init_database():
    # Cargar variables de entorno
    load_dotenv()

    # Credenciales de la base de datos
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "carwash_db")

    # Intentar conectar al servidor MySQL (con reintentos)
    max_retries = 5
    retry_count = 0

    while retry_count < max_retries:
        try:
            print(f"Intentando conectar a MySQL en {DB_HOST}:{DB_PORT}...")
            conn = mysql.connector.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD
            )
            break
        except mysql.connector.Error as err:
            retry_count += 1
            print(f"Error al conectar: {err}")
            if retry_count < max_retries:
                wait_time = 2 * retry_count
                print(f"Reintentando en {wait_time} segundos...")
                time.sleep(wait_time)
            else:
                print("Número máximo de intentos alcanzado. Verifique que MySQL esté en ejecución.")
                return

    cursor = conn.cursor()

    try:
        # Crear la base de datos si no existe
        print(f"Creando base de datos {DB_NAME} si no existe...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")

        # Cambiar a la base de datos creada
        cursor.execute(f"USE {DB_NAME}")

        # Leer y ejecutar el archivo de esquema SQL
        print("Ejecutando script de migración...")
        with open("../supabase/migrations/20250328194951_odd_meadow.sql", "r") as f:
            # Separar comandos por punto y coma y ejecutarlos uno por uno
            script = f.read()
            for statement in script.split(';'):
                if statement.strip():
                    cursor.execute(statement)
                    conn.commit()

        print(f"Base de datos '{DB_NAME}' inicializada correctamente!")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    init_database()