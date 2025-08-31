import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { WeatherData, ForecastData, ApiResponse } from '../types/weather'

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api'}),
  tagTypes: ['Weather', 'Forecast'],
  endpoints: (builder) => ({
    getCurrentWeather: builder.query<WeatherData, string>({
      query: (cityName) => ({
        url: 'weather',
        params: {city: cityName, type: 'current'}
      }),
      providesTags: (result, error, cityName) => [{ type: 'Weather', id: cityName }],
      transformResponse: (response: ApiResponse<WeatherData>) => response.data,
    }),
    getForecast: builder.query<ForecastData, string>({
      query: (cityName) => ({
        url: 'weather',
        params: {city: cityName, type: 'forecast'}
      }),
      providesTags: (result, error, cityName) => [{type: 'Forecast', id: cityName}],
      transformResponse: (response: ApiResponse<ForecastData>) => response.data,
    }),
  }),
})

export const { 
  useGetCurrentWeatherQuery, 
  useGetForecastQuery, 
} = weatherApi


export default weatherApi.reducer
