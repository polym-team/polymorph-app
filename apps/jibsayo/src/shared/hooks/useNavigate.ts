import { useRouter } from 'next/navigation';

import { ROUTE_PATH } from '../consts/route';
import { openWebview } from '../services/webviewService';
import { useGlobalConfigStore } from '../stores/globalConfigStore';

interface Return {
  navigate: (path: string) => void;
}

const OPEN_NEW_WEBVIEW_PATH = [ROUTE_PATH.APART_DETAIL];

export const useNavigate = (): Return => {
  const router = useRouter();
  const { isInApp } = useGlobalConfigStore();

  const pushNavigate = (path: string) => {
    console.log('pushNavigate', path);
    router.push(path);
  };

  const openNewWebview = (path: string) => {
    openWebview(process.env.BASE_URL + path);
  };

  const navigate = (path: string) => {
    const isOpenWebviewTarget =
      isInApp && OPEN_NEW_WEBVIEW_PATH.some(target => path.startsWith(target));

    if (isOpenWebviewTarget) {
      openNewWebview(path);
    } else {
      pushNavigate(path);
    }
  };

  return { navigate };
};
