
import { supabase } from './mobile/src/lib/supabase';

async function checkImages() {
    const { data, error } = await supabase
        .from('listings')
        .select('images')
        .limit(5);

    if (error) {
        console.error(error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

checkImages();
