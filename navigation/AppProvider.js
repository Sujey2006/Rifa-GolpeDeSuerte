import { useEffect, useState } from "react"
import sqliteService from '../src/services/sqliteService';
import { ActivityIndicator, View, Platform } from "react-native";
import platformUtils from '../src/utils/platformUtils';

const AppProvider =({children}) =>{
    const [ready, setReady] = useState(false);

    useEffect(()=>{
        let mounted = true;
        
        // Log de plataforma
        platformUtils.logPlatform();
        
        const init = async() =>{
            try {
                await sqliteService.initDB();
                console.log(`✅ Base de datos inicializada en ${Platform.OS}`);
                if (mounted) setReady(true);
            } catch (e) {
                console.warn('⚠️ Error al inicializar DB:', e);
                if (mounted) setReady(true); // Permitir que la app continúe incluso si DB falla
            }
        }
        init();
        return ()=>{mounted= false}
    },[]);

    if (!ready){
        return(
            <View style ={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size = "large"/>
            </View>
        )
    }
    return children;
}

export default AppProvider