export async function fetchSettings() {
  try {
    const res = await fetch("/api/setting");
    const data = await res.json();

    if (data.success && data.settings) {
      return {
        wifiName: data.settings.wifiName || "",
        wifiPassword: data.settings.wifiPassword || "",
      };
    } else {
      throw new Error(data.error || "Gagal memuat pengaturan");
    }
  } catch (error) {
    throw new Error("Gagal terhubung ke server: " + error.message);
  }
}

export async function saveSettings({ wifiName, wifiPassword }) {
  try {
    const res = await fetch("/api/setting", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wifiName, wifiPassword }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Gagal menyimpan pengaturan");
    }

    return true;
  } catch (error) {
    throw new Error("Gagal menyimpan pengaturan: " + error.message);
  }
}
